package org.ciyex.ehr.waitlist.repository;

import org.ciyex.ehr.waitlist.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    List<Waitlist> findByOrgAliasOrderByPriorityAscCreatedAtDesc(String orgAlias);
}
