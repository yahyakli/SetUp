package SetUp.Billing.Service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetails {
    private String userId;
    private String username;
    private String email;
    private String role;
}