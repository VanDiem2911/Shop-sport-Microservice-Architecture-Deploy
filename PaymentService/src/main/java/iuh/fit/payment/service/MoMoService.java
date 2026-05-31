package iuh.fit.payment.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class MoMoService {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.api-url}")
    private String apiUrl;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${momo.mock-mode:false}")
    private boolean mockMode;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> createPaymentUrl(Long orderId, Double amountDouble) {
        try {
            long amount = amountDouble.longValue();
            String rawOrderId = orderId + "-" + System.currentTimeMillis();
            String requestId = rawOrderId;
            String orderInfo = "Thanh toan don hang #" + orderId;
            String requestType = "captureWallet";
            String extraData = "";

            if (mockMode) {
                System.out.println("MoMo mock-mode is ENABLED. Generating mock redirect url...");
                String transId = "MOCK-MOMO-" + System.currentTimeMillis();
                String responseTime = String.valueOf(System.currentTimeMillis());
                String resultCode = "0"; // Success
                String message = "Success";
                String orderType = "momo_wallet";
                String payType = "webApp";
                
                // Fields to sign:
                // accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
                String rawSig = String.format(
                    "accessKey=%s&amount=%d&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                    accessKey, amount, extraData, message, rawOrderId, orderInfo, orderType, partnerCode, requestId, responseTime, resultCode, transId
                );
                String sig = signHmacSHA256(rawSig, secretKey);
                
                String mockPayUrl = String.format(
                    "%s?partnerCode=%s&orderId=%s&requestId=%s&amount=%d&orderInfo=%s&orderType=%s&transId=%s&resultCode=%s&message=%s&payType=%s&responseTime=%s&extraData=%s&signature=%s",
                    redirectUrl, partnerCode, rawOrderId, requestId, amount, java.net.URLEncoder.encode(orderInfo, "UTF-8"), orderType, transId, resultCode, message, payType, responseTime, extraData, sig
                );
                
                Map<String, Object> mockRes = new HashMap<>();
                mockRes.put("payUrl", mockPayUrl);
                mockRes.put("resultCode", 0);
                return mockRes;
            }

            // Signature raw string in alphabetical order:
            // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
            String rawSignature = String.format(
                "accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey, amount, extraData, ipnUrl, rawOrderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
            );

            System.out.println("MoMo Raw Signature string: " + rawSignature);
            String signature = signHmacSHA256(rawSignature, secretKey);

            Map<String, Object> payload = new HashMap<>();
            payload.put("partnerCode", partnerCode);
            payload.put("partnerName", "Sport Shop");
            payload.put("storeId", "SportShopStore");
            payload.put("requestId", requestId);
            payload.put("amount", amount);
            payload.put("orderId", rawOrderId);
            payload.put("orderInfo", orderInfo);
            payload.put("redirectUrl", redirectUrl);
            payload.put("ipnUrl", ipnUrl);
            payload.put("lang", "vi");
            payload.put("extraData", extraData);
            payload.put("requestType", requestType);
            payload.put("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            System.out.println("Calling MoMo API at: " + apiUrl);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);
            Map<String, Object> response = responseEntity.getBody();

            System.out.println("MoMo API Response: " + response);
            return response;
        } catch (Exception e) {
            System.err.println("Error calling MoMo: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean verifySignature(Map<String, Object> params) {
        try {
            String incomingSignature = (String) params.get("signature");
            if (incomingSignature == null) {
                return false;
            }

            // A helper to safely get values as string
            java.util.function.Function<String, String> getVal = (key) -> {
                Object val = params.get(key);
                if (val == null) return "";
                if (val instanceof Double) {
                    return String.valueOf(((Double) val).longValue());
                }
                if (val instanceof Long) {
                    return String.valueOf(val);
                }
                if (val instanceof Integer) {
                    return String.valueOf(val);
                }
                return String.valueOf(val);
            };

            String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                accessKey,
                getVal.apply("amount"),
                getVal.apply("extraData"),
                getVal.apply("message"),
                getVal.apply("orderId"),
                getVal.apply("orderInfo"),
                getVal.apply("orderType"),
                getVal.apply("partnerCode"),
                getVal.apply("requestId"),
                getVal.apply("responseTime"),
                getVal.apply("resultCode"),
                getVal.apply("transId")
            );

            System.out.println("Verifying raw signature: " + rawSignature);
            String calculatedSignature = signHmacSHA256(rawSignature, secretKey);
            System.out.println("Calculated signature: " + calculatedSignature);
            System.out.println("Incoming signature:   " + incomingSignature);

            return calculatedSignature.equalsIgnoreCase(incomingSignature);
        } catch (Exception e) {
            System.err.println("Error verifying signature: " + e.getMessage());
            return false;
        }
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256HMAC.init(secretKeySpec);
        byte[] rawHmac = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return toHexString(rawHmac);
    }

    private String toHexString(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
