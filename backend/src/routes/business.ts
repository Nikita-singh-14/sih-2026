import { Router, type Response } from 'express'
import {
  authenticate,
  requireBusinessOrganisation,
  type AuthenticatedRequest,
} from '../middleware/auth'
import { businessService } from '../services/businessService'

const router = Router()

// All routes here require valid JWT authentication and APPLICANT_BUSINESS role
router.use(authenticate)
router.use(requireBusinessOrganisation)

/**
 * 1. Overview & Metrics
 */
router.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const overview = await businessService.getOverview(req.organisationId!)
    return res.json(overview)
  } catch (error: any) {
    console.error('Error in /business/overview:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch overview metrics' })
  }
})

/**
 * 2. Profile & Settings
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await businessService.getProfile(req.organisationId!)
    return res.json(profile)
  } catch (error: any) {
    console.error('Error in /business/profile:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch business profile' })
  }
})

router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await businessService.updateProfile(req.organisationId!, req.body)
    return res.json(updated)
  } catch (error: any) {
    console.error('Error in PUT /business/profile:', error)
    return res.status(400).json({ message: error.message || 'Failed to update business profile' })
  }
})

/**
 * 3. Instruments (Fleet Management)
 */
router.get('/instruments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const type = typeof req.query.type === 'string' ? req.query.type : undefined

    const instruments = await businessService.getInstruments(req.organisationId!, { search, status, type })
    return res.json(instruments)
  } catch (error: any) {
    console.error('Error in /business/instruments:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch instruments' })
  }
})

router.get('/instruments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instrumentId = String(req.params.id)
    const instrument = await businessService.getInstrumentById(req.organisationId!, instrumentId)
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument not found or unauthorized' })
    }
    return res.json(instrument)
  } catch (error: any) {
    console.error('Error in GET /business/instruments/:id:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch instrument details' })
  }
})

router.post('/instruments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instrument = await businessService.createInstrument(req.organisationId!, req.body)
    return res.status(201).json(instrument)
  } catch (error: any) {
    console.error('Error in POST /business/instruments:', error)
    return res.status(400).json({ message: error.message || 'Failed to register instrument' })
  }
})

router.put('/instruments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const instrumentId = String(req.params.id)
    const updated = await businessService.updateInstrument(req.organisationId!, instrumentId, req.body)
    return res.json(updated)
  } catch (error: any) {
    console.error('Error in PUT /business/instruments/:id:', error)
    return res.status(400).json({ message: error.message || 'Failed to update instrument' })
  }
})

/**
 * 4. Verification Applications
 */
router.get('/applications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const type = typeof req.query.type === 'string' ? req.query.type : undefined

    const applications = await businessService.getApplications(req.organisationId!, { search, status, type })
    return res.json(applications)
  } catch (error: any) {
    console.error('Error in /business/applications:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch applications' })
  }
})

router.get('/applications/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = String(req.params.id)
    const application = await businessService.getApplicationById(req.organisationId!, applicationId)
    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized' })
    }
    return res.json(application)
  } catch (error: any) {
    console.error('Error in GET /business/applications/:id:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch application details' })
  }
})

router.post('/applications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await businessService.createApplication(req.organisationId!, req.body)
    return res.status(201).json(application)
  } catch (error: any) {
    console.error('Error in POST /business/applications:', error)
    return res.status(400).json({ message: error.message || 'Failed to submit verification application' })
  }
})

/**
 * 5. Digital Certificates
 */
router.get('/certificates', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certificates = await businessService.getCertificates(req.organisationId!)
    return res.json(certificates)
  } catch (error: any) {
    console.error('Error in /business/certificates:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch certificates' })
  }
})

router.get('/certificates/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certId = String(req.params.id)
    const cert = await businessService.getCertificateById(req.organisationId!, certId)
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found or unauthorized' })
    }
    return res.json(cert)
  } catch (error: any) {
    console.error('Error in GET /business/certificates/:id:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch certificate' })
  }
})

router.get('/certificates/:id/download', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certId = String(req.params.id)
    const cert = await businessService.getCertificateById(req.organisationId!, certId)
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found or unauthorized' })
    }

    // Set download headers for official printable certificate HTML/PDF preview
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `inline; filename="Certificate-${cert.certificateNo}.html"`)

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verification Certificate #${cert.certificateNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px; }
    .cert-card { max-width: 750px; margin: 0 auto; background: #ffffff; border: 3px double #0284c7; padding: 40px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .header h1 { font-size: 20px; color: #0369a1; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 16px; margin: 8px 0 4px; color: #334155; }
    .header p { font-size: 12px; color: #64748b; margin: 0; }
    .table { width: 100%; margin-top: 30px; border-collapse: collapse; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table td.label { font-weight: 600; color: #475569; width: 35%; }
    .table td.val { font-weight: 500; color: #0f172a; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e2e8f0; padding-top: 20px; }
    .qr { text-align: center; }
    .seal-box { text-align: right; }
    .seal-box strong { display: block; margin-top: 40px; border-top: 1px solid #000; padding-top: 5px; }
    @media print { body { padding: 0; background: white; } .cert-card { box-shadow: none; border: 2px solid #000; } }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="header">
      <p>GOVERNMENT OF NCT OF DELHI · DEPARTMENT OF LEGAL METROLOGY</p>
      <h1>Certificate of Verification & Stamping</h1>
      <h2>[Issued under Section 24 of The Legal Metrology Act, 2009]</h2>
      <p>Certificate No: <strong>${cert.certificateNo}</strong></p>
    </div>
    <table class="table">
      <tr><td class="label">Certificate ID</td><td class="val">${cert.certificateNo}</td></tr>
      <tr><td class="label">Instrument ID</td><td class="val">${cert.instrumentId}</td></tr>
      <tr><td class="label">Instrument Description</td><td class="val">${cert.instrumentName}</td></tr>
      <tr><td class="label">Premises / Location</td><td class="val">${cert.premises}</td></tr>
      <tr><td class="label">Lead Security Seal No</td><td class="val">${cert.sealNumber}</td></tr>
      <tr><td class="label">Verification Date</td><td class="val">${cert.issuedDate}</td></tr>
      <tr><td class="label">Expiry Date</td><td class="val"><strong>${cert.expiryDate}</strong></td></tr>
      <tr><td class="label">Verifying Officer</td><td class="val">${cert.issuedBy}</td></tr>
      <tr><td class="label">Verification Status</td><td class="val" style="color: #0d9488; font-weight: bold;">${cert.status.toUpperCase()}</td></tr>
    </table>
    <div class="footer">
      <div class="qr">
        <img src="${cert.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${cert.certificateNo}`}" alt="QR Code" width="100" height="100" />
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Scan to Verify Online</div>
      </div>
      <div class="seal-box">
        <p style="font-size: 13px; color: #334155; margin: 0;">Digitally Signed & Certified by:</p>
        <p style="font-size: 14px; font-weight: 600; color: #0369a1; margin: 4px 0 0;">${cert.issuedBy}</p>
        <strong>Legal Metrology Officer</strong>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('load', () => {
      // Auto print dialog if opened in new window
      if (window.location.search.includes('print=true')) {
        window.print();
      }
    });
  </script>
</body>
</html>`
    return res.send(html)
  } catch (error: any) {
    console.error('Error in GET /business/certificates/:id/download:', error)
    return res.status(500).json({ message: error.message || 'Failed to download certificate' })
  }
})

/**
 * 6. Field Operations & Scheduled Inspections
 */
router.get('/inspections', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspections = await businessService.getInspections(req.organisationId!)
    return res.json(inspections)
  } catch (error: any) {
    console.error('Error in /business/inspections:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch field visit inspections' })
  }
})

/**
 * 7. Stakeholders (Premises & Licensed Repairers)
 */
router.get('/stakeholders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stakeholders = await businessService.getStakeholders(req.organisationId!)
    return res.json(stakeholders)
  } catch (error: any) {
    console.error('Error in /business/stakeholders:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch stakeholders' })
  }
})

/**
 * 8. Reports & Analytics
 */
router.get('/reports', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await businessService.getReports(req.organisationId!)
    return res.json(reports)
  } catch (error: any) {
    console.error('Error in /business/reports:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch reports' })
  }
})

router.get('/reports/compliance-audit/download', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await businessService.getProfile(req.organisationId!)
    const instruments = await businessService.getInstruments(req.organisationId!)
    const certificates = await businessService.getCertificates(req.organisationId!)

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `inline; filename="Annual-Compliance-Report-${profile.name}.html"`)

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Annual Legal Metrology Compliance Audit Report</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #1e293b; }
    h1 { color: #0284c7; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>Legal Metrology Compliance Audit Report (FY 2024-25)</h1>
  <p><strong>Organization:</strong> ${profile.name} (GSTIN: ${profile.gstin || 'N/A'})</p>
  <p><strong>LM Registration No:</strong> ${profile.lmRegistrationNo || 'N/A'}</p>
  <p><strong>Total Equipment Fleet:</strong> ${instruments.length} Units</p>
  <p><strong>Valid Certificates:</strong> ${certificates.length} Active</p>
  
  <h2>Registered Equipment Inventory & Stamping Status</h2>
  <table>
    <thead>
      <tr>
        <th>Platform ID</th>
        <th>Type</th>
        <th>Serial No</th>
        <th>Location</th>
        <th>Status</th>
        <th>Next Verification Due</th>
      </tr>
    </thead>
    <tbody>
      ${instruments
        .map(
          (i) => `<tr>
            <td>${i.platformId}</td>
            <td>${i.type}</td>
            <td>${i.serialNumber}</td>
            <td>${i.location}</td>
            <td>${i.status}</td>
            <td>${i.nextDue}</td>
          </tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`
    return res.send(html)
  } catch (error: any) {
    console.error('Error in /reports/compliance-audit/download:', error)
    return res.status(500).json({ message: error.message || 'Failed to generate compliance report' })
  }
})

/**
 * 9. Notifications
 */
router.get('/notifications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await businessService.getNotifications(req.organisationId!)
    return res.json(notifications)
  } catch (error: any) {
    console.error('Error in /business/notifications:', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch notifications' })
  }
})

router.patch('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await businessService.markNotificationRead(req.organisationId!, String(req.params.id))
    return res.json({ success: true })
  } catch (error: any) {
    console.error('Error in PATCH /business/notifications/:id/read:', error)
    return res.status(500).json({ message: error.message || 'Failed to update notification' })
  }
})

export default router
