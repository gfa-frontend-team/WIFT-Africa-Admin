export enum ResourceType {
  VIDEO = 'VIDEO',
  PDF = 'PDF'
}

export enum ResourceStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface Resource {
  _id: string
  title: string
  description?: string
  resourceType: ResourceType
  fileUrl?: string
  externalLink?: string
  thumbnailUrl?: string
  status: ResourceStatus
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateResourceData {
  title: string
  description?: string
  resourceType: ResourceType
  file?: File
  externalLink?: string
  thumbnail?: File
  status?: ResourceStatus
}

export interface UpdateResourceData {
  title?: string
  description?: string
  resourceType?: ResourceType
  file?: File
  externalLink?: string
  thumbnail?: File
  status?: ResourceStatus
}

export interface ResourceFilters {
  page?: number
  limit?: number
  type?: ResourceType
  status?: ResourceStatus
  search?: string
}
