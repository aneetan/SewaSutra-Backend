package com.example.demo.service;

import com.example.demo.model.Contract;
import com.example.demo.model.AppPayment;

public interface PdfService {

    String generateContractPdf(Contract contract);

    String generatePaymentReceiptPdf(AppPayment payment);
}
