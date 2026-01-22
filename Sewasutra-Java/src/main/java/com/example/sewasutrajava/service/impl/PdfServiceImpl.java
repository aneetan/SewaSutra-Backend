package com.example.demo.service.impl;

import com.example.demo.model.Contract;
import com.example.demo.model.AppPayment;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.PdfService;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Path;

@Service
public class PdfServiceImpl implements PdfService {

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public String generateContractPdf(Contract contract) {
        String fileName = "contract_" + contract.getProjectId() + ".pdf";
        Path targetPath = fileStorageService.getFilePath(fileName, "contracts");

        try {
            PdfWriter writer = new PdfWriter(new FileOutputStream(targetPath.toFile()));
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("SewaSutra Platform - Service Contract").setFontSize(20).setBold());
            document.add(new Paragraph("Project ID: " + contract.getProjectId()));
            document.add(new Paragraph("Date: " + contract.getCreatedAt()));
            document.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[] { 1, 2 })).useAllAvailableWidth();
            table.addCell("Client:");
            table.addCell(contract.getClient().getName());
            table.addCell("Service Provider:");
            table.addCell(contract.getCompany().getUser().getName());
            table.addCell("Service Type:");
            table.addCell(contract.getServiceType().name());
            table.addCell("Total Amount:");
            table.addCell("NPR " + contract.getAmount());
            document.add(table);

            document.add(new Paragraph("\nTerms and Conditions:"));
            document.add(new Paragraph(contract.getTermsAndConditions()));

            document.close();
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Error generating contract PDF", e);
        }
    }

    @Override
    public String generatePaymentReceiptPdf(AppPayment payment) {
        String fileName = "receipt_" + payment.getTransactionId() + ".pdf";
        Path targetPath = fileStorageService.getFilePath(fileName, "receipts");

        try {
            PdfWriter writer = new PdfWriter(new FileOutputStream(targetPath.toFile()));
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("SewaSutra Platform - Payment Receipt").setFontSize(18).setBold());
            document.add(new Paragraph("Transaction ID: " + payment.getTransactionId()));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Paid By: " + payment.getClient().getName()));
            document.add(new Paragraph("Paid To: " + payment.getCompany().getUser().getName()));
            document.add(new Paragraph("Amount: NPR " + payment.getAmount()));
            document.add(new Paragraph("Status: " + payment.getStatus()));
            document.add(new Paragraph("Gateway: " + payment.getGateway()));

            document.close();
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Error generating receipt PDF", e);
        }
    }
}
