package com.laev.remem.service

import com.laev.remem.entity.Member
import com.laev.remem.exception.EmailAlreadyExistsException
import com.laev.remem.exception.InvalidCredentialsException
import com.laev.remem.repository.MemberRepository
import com.laev.remem.security.JwtTokenProvider
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val memberRepository: MemberRepository,
    private val passwordEncoder: BCryptPasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
) {
    fun signUp(email: String, password: String, name: String) {
        if (isDuplicatedEmail(email)) {
            throw EmailAlreadyExistsException(email)
        }
        val hashedPassword = passwordEncoder.encode(password)
        val newMember = Member(
            email = email,
            password = hashedPassword,
            name = name,
        )
        memberRepository.save(newMember)
    }

    fun signIn(email: String, password: String): String {
        val member = memberRepository.findByEmail(email) ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(password, member.password)) {
            throw InvalidCredentialsException()
        }
        return jwtTokenProvider.generateToken(member.email)
    }

    fun getMemberFromToken(authorizationHeader: String): Member {
        val token = authorizationHeader.substringAfter("Bearer ")
        val email = jwtTokenProvider.extractEmail(token)

        return memberRepository.findByEmail(email)
            ?: throw IllegalArgumentException("Member with the specified email not found: $email")
    }

    private fun isDuplicatedEmail(email: String): Boolean {
        return memberRepository.findByEmail(email) != null
    }
}
