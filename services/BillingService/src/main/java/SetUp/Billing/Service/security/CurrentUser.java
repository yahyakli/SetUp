package SetUp.Billing.Service.security;

import SetUp.Billing.Service.model.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public UserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return (UserDetails) authentication.getPrincipal();
        }
        return null;
    }

    public String getCurrentUserId() {
        UserDetails userDetails = getCurrentUser();
        return userDetails != null ? userDetails.getUserId() : null;
    }

    public boolean hasRole(String role) {
        UserDetails userDetails = getCurrentUser();
        return userDetails != null && role.equalsIgnoreCase(userDetails.getRole());
    }
}
