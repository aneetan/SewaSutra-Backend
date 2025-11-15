import z from "zod";

export const CompanySchema = z.object({
   body: z.object({
      // Accept both objects and JSON strings for all schemas
      companyInfoSchema: z.union([
         z.object({
            name: z.string().min(1, 'Company name is required').max(255, 'Company name is too long'),
            registrationNo: z.string().min(1, 'Registration number is required'),
            description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
            establishedYear: z.string()
               .min(4, 'Invalid year')
               .max(4, 'Invalid year')
               .regex(/^\d{4}$/, 'Year must be 4 digits'),
            serviceCategory: z.string().min(1, 'Service category is required'),
            websiteUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
         }),
         z.string().min(1, 'Company info is required') // Allow JSON string
      ]),

      servicePricingSchema: z.union([
         z.object({
            servicesOffered: z.array(z.string().min(1, 'Service cannot be empty'))
               .min(1, 'At least one service must be provided')
               .max(5, 'At most five services must be provided'),
            priceRangeMin: z.union([
               z.number().int('Price must be an integer').min(0, 'Minimum price cannot be negative'),
               z.string().min(1, 'Minimum price is required').transform(Number) // Convert string to number
            ]),
            priceRangeMax: z.union([
               z.number().int('Price must be an integer').min(0, 'Maximum price cannot be negative'),
               z.string().min(1, 'Maximum price is required').transform(Number) // Convert string to number
            ]),
            avgDeliveryTime: z.string().min(1, 'Average delivery time is required'),
         }).refine((data) => data.priceRangeMax >= data.priceRangeMin, {
            message: 'Maximum price must be greater than or equal to minimum price',
            path: ['priceRangeMax'],
         }),
         z.string().min(1, 'Service pricing is required') // Allow JSON string
      ]),

      // Updated for Cloudinary URLs instead of File objects
      docsValidationSchema: z.union([
         z.object({
            logo: z.string().url('Logo must be a valid URL').optional().or(z.literal('')),
            businessLicense: z.string().url('Business license must be a valid URL').optional().or(z.literal('')),
            taxCertificate: z.string().url('Tax certificate must be a valid URL').optional().or(z.literal('')),
            ownerId: z.string().url('Owner ID must be a valid URL').optional().or(z.literal('')).nullable(),
         }),
         z.string().optional() // Allow JSON string or empty
      ]).optional(),

      userId: z.union([
         z.number().int('User ID must be an integer'),
         z.string().min(1, 'User ID is required').transform(Number) // Convert string to number
      ])
   })
});

export type CompanyInput = z.infer<typeof CompanySchema>['body'];