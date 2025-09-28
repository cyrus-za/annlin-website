import { toast } from "@/hooks/use-toast"

// Common toast messages in Afrikaans
export const toastMessages = {
  success: {
    saved: "Suksesvol gestoor!",
    created: "Suksesvol geskep!",
    updated: "Suksesvol opgedateer!",
    deleted: "Suksesvol verwyder!",
    sent: "Suksesvol gestuur!",
    published: "Suksesvol gepubliseer!",
    invited: "Uitnodiging suksesvol gestuur!",
  },
  error: {
    general: "ʼn Onverwagte fout het voorgekom.",
    network: "Netwerk fout. Probeer asseblief weer.",
    validation: "Validasie fout. Kontroleer jou invoer.",
    unauthorized: "Jy het nie toestemming vir hierdie aksie nie.",
    notFound: "Die aangevraagde item kon nie gevind word nie.",
    serverError: "Bediener fout. Probeer asseblief later weer.",
  },
  warning: {
    unsavedChanges: "Jy het ongestoorde veranderinge.",
    confirmDelete: "Hierdie aksie kan nie ongedaan gemaak word nie.",
    sessionExpiring: "Jou sessie gaan binnekort verval.",
  },
  info: {
    loading: "Laai tans...",
    processing: "Verwerk tans...",
    saving: "Stoor tans...",
    uploading: "Laai tans op...",
  },
}

// Helper functions for common toast patterns
export const showSuccessToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
    variant: "success",
  })
}

export const showErrorToast = (message: string, description?: string) => {
  toast({
    title: "Fout",
    description: message,
    variant: "destructive",
  })
}

export const showWarningToast = (message: string, description?: string) => {
  toast({
    title: "Waarskuwing",
    description: message,
    variant: "warning",
  })
}

export const showInfoToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
    variant: "info",
  })
}

// Specific business logic toasts
export const showSaveSuccessToast = () => {
  showSuccessToast(toastMessages.success.saved, "Jou veranderinge is suksesvol gestoor.")
}

export const showCreateSuccessToast = (itemType: string) => {
  showSuccessToast(toastMessages.success.created, `${itemType} is suksesvol geskep.`)
}

export const showUpdateSuccessToast = (itemType: string) => {
  showSuccessToast(toastMessages.success.updated, `${itemType} is suksesvol opgedateer.`)
}

export const showDeleteSuccessToast = (itemType: string) => {
  showSuccessToast(toastMessages.success.deleted, `${itemType} is suksesvol verwyder.`)
}

export const showNetworkErrorToast = () => {
  showErrorToast(toastMessages.error.network, "Kontroleer jou internet verbinding en probeer weer.")
}

export const showValidationErrorToast = (errors?: string[]) => {
  const description = errors?.length 
    ? `Foute: ${errors.join(", ")}`
    : "Kontroleer dat alle velde korrek ingevul is."
  
  showErrorToast(toastMessages.error.validation, description)
}

export const showUnauthorizedToast = () => {
  showErrorToast(toastMessages.error.unauthorized, "Meld asseblief aan om voort te gaan.")
}

export const showServerErrorToast = () => {
  showErrorToast(toastMessages.error.serverError, "Kontak ondersteuning as die probleem aanhou.")
}

// Loading state toasts
export const showLoadingToast = (message: string = toastMessages.info.loading) => {
  return toast({
    title: message,
    variant: "info",
    duration: 0, // Don't auto-dismiss loading toasts
  })
}

export const showProcessingToast = () => {
  return showLoadingToast(toastMessages.info.processing)
}

export const showSavingToast = () => {
  return showLoadingToast(toastMessages.info.saving)
}

export const showUploadingToast = () => {
  return showLoadingToast(toastMessages.info.uploading)
}

// Confirmation toasts
export const showUnsavedChangesToast = () => {
  showWarningToast(
    toastMessages.warning.unsavedChanges,
    "Stoor jou veranderinge voordat jy wegnavigeer."
  )
}

export const showDeleteConfirmationToast = (itemName: string, onConfirm: () => void) => {
  toast({
    title: `Verwyder ${itemName}?`,
    description: toastMessages.warning.confirmDelete,
    variant: "warning",
    action: {
      altText: "Bevestig",
      onClick: onConfirm,
    },
  })
}
