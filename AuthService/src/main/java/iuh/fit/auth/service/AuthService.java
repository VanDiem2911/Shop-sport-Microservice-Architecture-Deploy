package iuh.fit.auth.service;

import iuh.fit.auth.entity.User;
import iuh.fit.auth.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${google.client-id}")
    private String googleClientId;

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        return userRepository.save(user);
    }

    public java.util.Map<String, String> login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        if (passwordEncoder.matches(password, user.getPassword())) {
            String token = Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                    .compact();
            return java.util.Map.of("token", token, "role", user.getRole(), "username", username);
        }
        throw new RuntimeException("Sai mật khẩu");
    }

    public java.util.Map<String, String> loginWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new RuntimeException("Google ID Token không hợp lệ hoặc đã hết hạn");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // 1. Tìm hoặc tạo người dùng
            User user = userRepository.findFirstByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                
                // Đặt username dựa trên email (phần trước dấu @)
                String baseUsername = email.split("@")[0];
                String finalUsername = baseUsername;
                int counter = 1;
                while (userRepository.findByUsername(finalUsername).isPresent()) {
                    finalUsername = baseUsername + counter;
                    counter++;
                }
                
                newUser.setUsername(finalUsername);
                // Tạo mật khẩu ngẫu nhiên cho user Google
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRole("ROLE_USER");
                return userRepository.save(newUser);
            });

            // 2. Tạo mã JWT của hệ thống
            String token = Jwts.builder()
                    .setSubject(user.getUsername())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                    .compact();

            return java.util.Map.of(
                    "token", token,
                    "role", user.getRole(),
                    "username", user.getUsername()
            );
        } catch (Exception e) {
            throw new RuntimeException("Xác thực tài khoản Google thất bại: " + e.getMessage(), e);
        }
    }

    public User getUserInfo(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    }

    public User updateUserInfo(String username, String address, String phone) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
        user.setAddress(address);
        user.setPhone(phone);
        return userRepository.save(user);
    }
}