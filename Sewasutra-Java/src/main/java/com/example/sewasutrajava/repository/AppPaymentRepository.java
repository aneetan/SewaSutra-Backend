package com.example.demo.repository;

import com.example.demo.enums.PaymentStatus;
import com.example.demo.model.AppPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for AppPayment entity.
 * Handles payment transactions for contracts.
 */
@Repository
public interface AppPaymentRepository extends JpaRepository<AppPayment, Long> {

    List<AppPayment> findByContractId(Long contractId);

    List<AppPayment> findByClientId(Long clientId);

    List<AppPayment> findByCompanyId(Long companyId);

    List<AppPayment> findByStatus(PaymentStatus status);

    Optional<AppPayment> findByTransactionId(String transactionId);

    Optional<AppPayment> findByGatewayRefId(String gatewayRefId);

    @Query("SELECT SUM(p.amount) FROM AppPayment p WHERE p.contract.id = :contractId AND p.status = 'COMPLETED'")
    Double getTotalPaidByContractId(@Param("contractId") Long contractId);

    @Query("SELECT SUM(p.commission) FROM AppPayment p WHERE p.status = 'COMPLETED'")
    Double getTotalCommission();

    @Query("SELECT p FROM AppPayment p WHERE p.client.id = :userId OR p.company.user.id = :userId ORDER BY p.createdAt DESC")
    List<AppPayment> findPaymentHistoryByUserId(@Param("userId") Long userId);
}
