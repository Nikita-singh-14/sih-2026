export interface BusinessProfileUpdateInput {
  name?: string
  gstin?: string
  lmRegistrationNo?: string
  email?: string
  phone?: string
  address?: string
  expiryAlertDays?: number
}

export interface InstrumentCreateInput {
  type: string
  manufacturer: string
  model: string
  serialNumber: string
  capacity?: string
  accuracyClass?: string
  premises?: string
  location: string
}

export interface ApplicationCreateInput {
  type: string
  instrumentId: string
  instrumentName?: string
  location?: string
  feeAmount?: number
  remarks?: string
}

export interface ApplicationStatusUpdateInput {
  status?: string
  reason?: string
  actorId?: string
}
