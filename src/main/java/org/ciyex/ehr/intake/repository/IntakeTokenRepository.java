package org.ciyex.ehr.intake.repository;

import org.ciyex.ehr.intake.entity.IntakeToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IntakeTokenRepository extends JpaRepository<IntakeToken, Long> {

    Optional<IntakeToken> findByToken(String token);
}
