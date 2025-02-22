package com.nowtrip.api.security.oAuth;

import com.nowtrip.api.entity.User;
import com.nowtrip.api.enums.Role;
import com.nowtrip.api.repository.UserRepository;
import com.nowtrip.api.response.oAuth.GoogleResponse;
import com.nowtrip.api.response.oAuth.NaverResponse;
import com.nowtrip.api.response.oAuth.OAuth2Response;
import com.nowtrip.api.security.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // "naver", "google" ...
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2Response oAuth2Response;
        if (registrationId.equals("naver")) {
            oAuth2Response = new NaverResponse(attributes);
        } else if (registrationId.equals("google")) {
            oAuth2Response = new GoogleResponse(attributes);
        } else {
            return null;
        }

        String socialEmail = oAuth2Response.getEmail();
        String socialName = oAuth2Response.getName();
        String socialPicture = oAuth2Response.getPicture();

        Optional<User> existUser = userRepository.findByEmail(socialEmail);
        // 가입되지 않은 유저
        User user;
        if (existUser.isEmpty()) {
            String randomNickname = "user_" + UUID.randomUUID().toString().substring(0, 8);

            user = User.builder()
                    .email(socialEmail)
                    .password("SOCIAL_LOGIN")
                    .name(socialName)
                    .nickname(randomNickname)
                    .phoneNumber(null)
                    .profile(socialPicture)
                    .isSocial(true)
                    .role(Role.USER)
                    .build();
        } else {
            // 가입한 유저의 정보 최신 업데이트
            user = existUser.get();
            user.setName(socialName);
            user.setProfile(socialPicture);
        }
        userRepository.save(user);

        PrincipalDetails principalDetails = new PrincipalDetails(user);
        principalDetails.setAttributes(attributes);

        return principalDetails;
    }
}
