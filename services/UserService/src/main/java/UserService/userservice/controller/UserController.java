package UserService.userservice.controller;

import UserService.userservice.dto.UserDto.UpdatePasswordRequest;
import UserService.userservice.dto.UserDto.UpdateUserRequest;
import UserService.userservice.dto.UserDto.UserResponse;
import UserService.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<UserResponse>> getUsersByIds(@RequestBody List<String> ids) {
        return ResponseEntity.ok(userService.getUsersByIds(ids));
    }

    @GetMapping("/search/{term}")
    public ResponseEntity<List<UserResponse>> searchUsersByTerm(@PathVariable String term) {
        return ResponseEntity.ok(userService.searchUsers(term));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, request));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(null);
        }
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(userService.updateAvatar(id, file));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(
            @PathVariable String id,
            @Valid @RequestBody UpdatePasswordRequest request) {
        try {
            userService.updatePassword(id, request);
            return ResponseEntity.ok("Password updated successfully");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body("Access denied");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body("Access denied");
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}