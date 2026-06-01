package iuh.fit.ai.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {
    private static final Logger log = LoggerFactory.getLogger(AIController.class);
    private static final Pattern HEIGHT_PATTERN = Pattern.compile("(?:1m\\s*)?(\\d{2,3})\\s*(?:cm)?");
    private static final Pattern WEIGHT_PATTERN = Pattern.compile("(\\d{2,3})\\s*(?:kg|kilo|can)");
    private static final Pattern UNDER_PRICE_PATTERN = Pattern.compile("(?:duoi|nho hon|toi da)\\s*(\\d+(?:[\\.,]\\d+)?)\\s*(trieu|k|nghin|ngan)?");
    private static final Set<String> PRODUCT_STOP_WORDS = Set.of(
            "toi", "minh", "can", "muon", "mua", "tu", "van", "cho", "hoi", "gia", "bao", "nhieu",
            "san", "pham", "loai", "nao", "tot", "duoi", "tren", "con", "hang", "khong", "shop"
    );

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    @Value("${product.service-url:http://product-service:8082/api/v1/products}")
    private String productServiceUrl;

    public AIController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is empty"));
        }

        String productContext = getProductContext(request.get("productId"));
        String shopProductContext = getShopProductContext(message.trim());
        String context = joinContexts(productContext, shopProductContext);
        String response = callGemini(message.trim(), context);
        if (response == null || response.isBlank()) {
            response = getSmartFallbackResponse(message, context);
        }

        return ResponseEntity.ok(Map.of("response", response));
    }

    private String callGemini(String message, String productContext) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not configured. Using fallback response.");
            return null;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", buildPrompt(message, productContext)))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 512
                    )
            );

            String requestBody = objectMapper.writeValueAsString(payload);
            String endpoint = geminiBaseUrl + "/models/" + geminiModel + ":generateContent";

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (httpResponse.statusCode() < 200 || httpResponse.statusCode() >= 300) {
                log.warn("Gemini API returned status {}: {}", httpResponse.statusCode(), httpResponse.body());
                return null;
            }

            JsonNode root = objectMapper.readTree(httpResponse.body());
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return null;
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return null;
            }

            return parts.get(0).path("text").asText(null);
        } catch (Exception e) {
            log.warn("Could not call Gemini API. Using fallback response.", e);
            return null;
        }
    }

    private String buildPrompt(String message, String productContext) {
        return """
                Ban la SportyAI, tro ly ban hang cua Shop-Sport.
                Nhiem vu:
                - Tu van san pham the thao, size, giao hang, thanh toan, doi tra.
                - Tra loi bang tieng Viet ngan gon, than thien, dung trong tam.
                - Neu co du lieu san pham ben duoi, hay dung dung ten, gia va ton kho trong do.
                - Neu khach hoi "gia", "bao nhieu", "con hang", "ton kho" va co du lieu san pham, tra loi truc tiep bang du lieu san pham.
                - Neu khong co du lieu san pham, moi khach mo trang san pham hoac noi ro san pham.
                - Khong bia ra ma giam gia, chinh sach, hoac thong tin don hang rieng tu.
                - Neu khach chui tuc, giu thai do lich su va dua ve viec ho tro mua hang.

                Du lieu san pham va shop:
                %s

                Cau hoi cua khach: %s
                """.formatted(productContext == null || productContext.isBlank() ? "Khong co." : productContext, message);
    }

    private String getSmartFallbackResponse(String msg, String productContext) {
        String normalized = normalizeText(msg);

        if (containsProfanity(normalized)) {
            return "Minh san sang ho tro ban ve san pham, size, gia, ton kho, giao hang va thanh toan. Ban can minh tu van noi dung nao?";
        }

        if (productContext != null && !productContext.isBlank()
                && (normalized.contains("gia") || normalized.contains("bao nhieu") || normalized.contains("ton kho") || normalized.contains("con hang"))) {
            return productContext;
        }

        if (isSizeQuestion(normalized)) {
            return recommendSize(normalized);
        }

        if (containsWord(normalized, "hello") || containsWord(normalized, "hi") || containsWord(normalized, "chao")) {
            return "Xin chao! Toi la SportyAI, tro ly ao cua Shop-Sport. Ban can tu van san pham, size hay giao hang?";
        }

        if (normalized.contains("bong da") || normalized.contains("da banh") || normalized.contains("giay da bong")) {
            return "Voi bong da, ban nen chon giay theo mat san: TF cho san co nhan tao, FG cho san co tu nhien. Ban dang choi san nao?";
        }

        if (normalized.contains("cau long") || normalized.contains("vot") || normalized.contains("yonex")) {
            return "Voi cau long, neu thich tan cong hay chon vot nang dau; neu thich phong thu linh hoat hay chon vot can bang.";
        }

        if (normalized.contains("bong ro") || normalized.contains("giay bong ro")) {
            return "Giay bong ro nen uu tien dem em, co chan tot va do bam san. Ban choi vi tri nao de minh tu van ky hon?";
        }

        if (normalized.contains("size") || normalized.contains("cao") || normalized.contains("nang")) {
            return "Ban cho minh biet chieu cao, can nang va dang san pham can mua. Minh se goi y size phu hop.";
        }

        if (normalized.contains("giao hang") || normalized.contains("ship")) {
            return "Shop ho tro giao hang. Thoi gian nhan hang phu thuoc khu vuc, thuong noi thanh se nhanh hon cac tinh.";
        }

        if (normalized.contains("thanh toan") || normalized.contains("cod") || normalized.contains("chuyen khoan")) {
            return "Shop ho tro cac hinh thuc thanh toan nhu COD, chuyen khoan hoac vi dien tu neu he thong dang bat.";
        }

        if (normalized.contains("don hang") || normalized.contains("kiem tra")) {
            return "Ban co the dang nhap va vao muc lich su don hang de xem trang thai don hang.";
        }

        return "Toi co the tu van san pham the thao, size, giao hang va thanh toan. Ban muon hoi ve san pham nao?";
    }

    private String getProductContext(String productId) {
        if (productId == null || productId.isBlank()) {
            return "";
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(productServiceUrl + "/" + productId.trim()))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (httpResponse.statusCode() < 200 || httpResponse.statusCode() >= 300) {
                return "";
            }

            JsonNode product = objectMapper.readTree(httpResponse.body());
            String name = product.path("name").asText("San pham");
            double price = product.path("price").asDouble(0);
            int stock = product.path("stock").asInt(0);
            String sport = product.path("sport").asText("");
            String category = product.path("category").path("name").asText("");
            String description = product.path("description").asText("");

            return "San pham: " + name
                    + "\nGia: " + String.format("%,.0f VND", price)
                    + "\nTon kho: " + stock
                    + "\nMon the thao: " + emptyToDefault(sport, "Khong ro")
                    + "\nDanh muc: " + emptyToDefault(category, "Khong ro")
                    + "\nMo ta: " + emptyToDefault(description, "Khong co");
        } catch (Exception e) {
            log.warn("Could not load product context for productId={}", productId, e);
            return "";
        }
    }

    private String getShopProductContext(String message) {
        String normalized = normalizeText(message);
        if (!isProductSearchQuestion(normalized)) {
            return "";
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(productServiceUrl))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (httpResponse.statusCode() < 200 || httpResponse.statusCode() >= 300) {
                return "";
            }

            JsonNode products = objectMapper.readTree(httpResponse.body());
            if (!products.isArray() || products.isEmpty()) {
                return "";
            }

            Double maxPrice = extractMaxPrice(normalized);
            List<ProductMatch> matches = new ArrayList<>();
            for (JsonNode product : products) {
                ProductMatch match = scoreProduct(product, normalized, maxPrice);
                if (match.score() > 0) {
                    matches.add(match);
                }
            }

            matches.sort(Comparator
                    .comparingInt(ProductMatch::score).reversed()
                    .thenComparingDouble(ProductMatch::price));

            if (matches.isEmpty()) {
                return "";
            }

            StringBuilder builder = new StringBuilder("San pham phu hop trong shop:");
            int limit = Math.min(matches.size(), 5);
            for (int i = 0; i < limit; i++) {
                ProductMatch match = matches.get(i);
                JsonNode product = match.product();
                builder.append("\n").append(i + 1).append(". ")
                        .append(product.path("name").asText("San pham"))
                        .append(" | Gia: ").append(String.format("%,.0f VND", match.price()))
                        .append(" | Ton kho: ").append(product.path("stock").asInt(0))
                        .append(" | Mon: ").append(emptyToDefault(product.path("sport").asText(""), "Khong ro"))
                        .append(" | Danh muc: ").append(emptyToDefault(product.path("category").path("name").asText(""), "Khong ro"));
            }

            return builder.toString();
        } catch (Exception e) {
            log.warn("Could not load shop product context.", e);
            return "";
        }
    }

    private ProductMatch scoreProduct(JsonNode product, String normalizedQuery, Double maxPrice) {
        String name = normalizeText(product.path("name").asText(""));
        String description = normalizeText(product.path("description").asText(""));
        String sport = normalizeText(product.path("sport").asText(""));
        String category = normalizeText(product.path("category").path("name").asText(""));
        String haystack = name + " " + description + " " + sport + " " + category;
        double price = product.path("price").asDouble(0);
        int stock = product.path("stock").asInt(0);

        if (maxPrice != null && price > maxPrice) {
            return new ProductMatch(product, 0, price);
        }

        int score = 0;
        if (stock > 0) {
            score += 1;
        }
        if (normalizedQuery.contains("bong da") && haystack.contains("bong da")) {
            score += 6;
        }
        if (normalizedQuery.contains("bong ro") && haystack.contains("bong ro")) {
            score += 6;
        }
        if (normalizedQuery.contains("cau long") && haystack.contains("cau long")) {
            score += 6;
        }
        if (normalizedQuery.contains("giay") && haystack.contains("giay")) {
            score += 5;
        }
        if (normalizedQuery.contains("ao") && haystack.contains("ao")) {
            score += 4;
        }
        if (normalizedQuery.contains("quan") && haystack.contains("quan")) {
            score += 4;
        }
        if (normalizedQuery.contains("bong") && haystack.contains("bong")) {
            score += 4;
        }
        if (normalizedQuery.contains("vot") && haystack.contains("vot")) {
            score += 4;
        }

        for (String token : normalizedQuery.split("\\s+")) {
            String cleanToken = token.replaceAll("[^a-z0-9]", "");
            if (cleanToken.length() < 3 || PRODUCT_STOP_WORDS.contains(cleanToken)) {
                continue;
            }
            if (haystack.contains(cleanToken)) {
                score += 1;
            }
        }

        return new ProductMatch(product, score, price);
    }

    private boolean isProductSearchQuestion(String normalized) {
        return normalized.contains("mua")
                || normalized.contains("tu van")
                || normalized.contains("san pham")
                || normalized.contains("gia")
                || normalized.contains("bong")
                || normalized.contains("giay")
                || normalized.contains("ao")
                || normalized.contains("quan")
                || normalized.contains("vot")
                || normalized.contains("cau long");
    }

    private Double extractMaxPrice(String normalized) {
        Matcher matcher = UNDER_PRICE_PATTERN.matcher(normalized);
        if (!matcher.find()) {
            return null;
        }

        double value = Double.parseDouble(matcher.group(1).replace(",", "."));
        String unit = matcher.group(2);
        if ("trieu".equals(unit)) {
            return value * 1_000_000;
        }
        if ("k".equals(unit) || "nghin".equals(unit) || "ngan".equals(unit)) {
            return value * 1_000;
        }
        return value;
    }

    private String joinContexts(String productContext, String shopProductContext) {
        StringBuilder builder = new StringBuilder();
        if (productContext != null && !productContext.isBlank()) {
            builder.append("San pham hien tai tren trang:\n").append(productContext);
        }
        if (shopProductContext != null && !shopProductContext.isBlank()) {
            if (!builder.isEmpty()) {
                builder.append("\n\n");
            }
            builder.append(shopProductContext);
        }
        return builder.toString();
    }

    private boolean isSizeQuestion(String normalized) {
        return normalized.contains("size")
                || normalized.contains("cao")
                || normalized.contains("nang")
                || normalized.contains("can nang")
                || normalized.contains("tu van co");
    }

    private String recommendSize(String normalized) {
        Integer height = extractHeight(normalized);
        Integer weight = extractWeight(normalized);

        if (height == null || weight == null) {
            return "Ban cho minh biet chieu cao va can nang theo dang: 1m75 70kg. Minh se goi y size phu hop.";
        }

        String size;
        if (weight < 55) {
            size = "S";
        } else if (weight < 65) {
            size = "M";
        } else if (weight < 78) {
            size = "L";
        } else if (weight < 90) {
            size = "XL";
        } else {
            size = "XXL";
        }

        if (height >= 180 && weight >= 90) {
            size = "XXL";
        } else if (height >= 175 && weight >= 78) {
            size = "XL";
        }

        return "Voi chieu cao " + height + "cm va can nang " + weight + "kg, minh goi y ban chon size "
                + size + ". Neu thich mac rong thoai mai thi nen tang them 1 size.";
    }

    private Integer extractHeight(String normalized) {
        Matcher meterMatcher = Pattern.compile("1m\\s*(\\d{2})").matcher(normalized);
        if (meterMatcher.find()) {
            return 100 + Integer.parseInt(meterMatcher.group(1));
        }

        Matcher matcher = HEIGHT_PATTERN.matcher(normalized);
        while (matcher.find()) {
            int value = Integer.parseInt(matcher.group(1));
            if (value >= 140 && value <= 220) {
                return value;
            }
        }
        return null;
    }

    private Integer extractWeight(String normalized) {
        Matcher matcher = WEIGHT_PATTERN.matcher(normalized);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    private boolean containsWord(String normalized, String word) {
        return Pattern.compile("\\b" + Pattern.quote(word) + "\\b").matcher(normalized).find();
    }

    private boolean containsProfanity(String normalized) {
        return normalized.contains("con di")
                || normalized.contains("dmm")
                || normalized.contains("dm ")
                || normalized.contains("dit")
                || normalized.contains("me m")
                || normalized.contains("mat day");
    }

    private String emptyToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private String normalizeText(String input) {
        String withoutAccents = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccents.toLowerCase();
    }

    private record ProductMatch(JsonNode product, int score, double price) {
    }
}
