package UserService.userservice.service;

import UserService.userservice.dto.UserDto.UpdatePasswordRequest;
import UserService.userservice.dto.UserDto.UpdateUserRequest;
import UserService.userservice.dto.UserDto.UserResponse;
import UserService.userservice.model.Role;
import UserService.userservice.model.User;
import UserService.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:${user.home}/uploads/avatars}")
    private String uploadDir;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(String id, UpdateUserRequest request) {
        User currentUser = getCurrentUserEntity();
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if current user is updating their own profile or is an admin
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You don't have permission to update this user");
        }

        if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
            userToUpdate.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null && !request.getLastName().isEmpty()) {
            userToUpdate.setLastName(request.getLastName());
        }

        if (request.getAvatar() != null) {
            userToUpdate.setAvatar(request.getAvatar());
        }

        userToUpdate.setUpdatedAt(new Date());

        userRepository.save(userToUpdate);

        return mapToUserResponse(userToUpdate);
    }

    @Transactional
    public UserResponse updateAvatar(String id, MultipartFile file) {
        User currentUser = getCurrentUserEntity();
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if current user is updating their own profile or is an admin
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You don't have permission to update this user");
        }

        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        // Validate file is an image
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File must be an image");
        }

        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Delete the old avatar file if it exists
            String oldAvatarUrl = userToUpdate.getAvatar();
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
                Path oldFilePath = uploadPath.resolve(oldAvatarUrl.substring(oldAvatarUrl.lastIndexOf("/") + 1));
                if (Files.exists(oldFilePath)) {
                    Files.delete(oldFilePath);
                }
            }

            // Generate a unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ?
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + fileExtension;

            // Save the new file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Update user with new avatar URL
            String avatarUrl = "/uploads/avatars/" + filename; // URL path
            userToUpdate.setAvatar(avatarUrl);
            userToUpdate.setUpdatedAt(new Date());

            userRepository.save(userToUpdate);

            return mapToUserResponse(userToUpdate);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Transactional
    public void updatePassword(String id, UpdatePasswordRequest request) {
        User currentUser = getCurrentUserEntity();
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if current user is updating their own password
        if (!currentUser.getId().equals(id)) {
            throw new AccessDeniedException("You can only update your own password");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), userToUpdate.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        userToUpdate.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userToUpdate.setUpdatedAt(new Date());

        userRepository.save(userToUpdate);
    }

    @Transactional
    public void deleteUser(String id) {
        User currentUser = getCurrentUserEntity();

        // Check if current user is deleting their own account or is an admin
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You don't have permission to delete this user");
        }

        userRepository.deleteById(id);
    }

    private User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}