package UserService.userservice.repo;

import UserService.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository {
    Optional<User> findByEmail(String email);
}
