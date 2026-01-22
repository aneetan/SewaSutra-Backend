import prisma from "../config/dbconfig";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config";

export async function generateContractDocument(contractId: number) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      company: true,
      client: true,
      requirement: true,
    },
  });

  if (!contract) throw new Error("Contract not found");

  // 1️⃣ Select template
  const templateFile =
    contract.serviceType === "MEP"
      ? "mep-contract.hbs"
      : "it-contract.hbs";

  const templatePath = path.join("D:/SewaSutra/SewaSutra-Backend/src/services/templates", templateFile);
  const source = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(source);

  // 2️⃣ Prepare data
  const html = template({
    contractDate: new Date().toLocaleDateString(),
    projectId: contract.projectId,
    projectName: contract.requirement?.title,
    clientName: contract.client.name,
    companyName: contract.company.name,
    projectLocation: contract.location,
    amount: contract.amount,
    scopeSummary: contract.scopeSummary,
    durationDays: contract.durationDays,
    defectLiabilityMonths: contract.defectLiabilityMonths,
  });

  // 3️⃣ Generate PDF buffer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  // 4️⃣ Upload PDF to Cloudinary
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "contracts",
        resource_type: "auto",
        public_id: `contract-${contract.projectId}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
  });

  // 5️⃣ Save URL in DB
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      contractFile: uploadResult.secure_url,
    },
  });

  return uploadResult.secure_url;
}
