package UserService.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "First name is required.")
        @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters.")
        private String firstName;

        @NotBlank(message = "Last name is required.")
        @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters.")
        private String lastName;

        @NotBlank(message = "Email is required.")
        @Email(message = "Please enter a valid email address.")
        private String email;

        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters long.")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
                message = "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
        )
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required.")
        @Email(message = "Please enter a valid email address.")
        private String email;

        @NotBlank(message = "Password is required.")
        private String password;

        private boolean rememberMe;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String id;
        private String email;

        public String getToken() {
            return token;
        }

        public String getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }
    }
}
