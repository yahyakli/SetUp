package UserService.userservice.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @UuidGenerator
    private String id;
    @Column(nullable = false, unique = true)
    private String email;
    private String password;
    private String first_name;
    private String last_name;
    @Enumerated(EnumType.STRING)
    private Role role;
    private Date created_at;
    private Date updated_at;
    @Enumerated(EnumType.STRING)
    private Status status;
}
