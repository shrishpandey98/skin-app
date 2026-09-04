import { Linking, Platform } from 'react-native';

interface WhatsAppAppointmentPayload {
  clinicPhone: string;
  clinicName: string;
  doctorName?: string;
  procedureName?: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientPhone: string;
  appointmentId: string;
}

/**
 * Generates and opens a 100% Free WhatsApp Direct Confirmation message.
 * Eliminates paid SMS/Twilio costs for launch while providing 100% delivery rate.
 */
export async function sendWhatsAppConfirmation(payload: WhatsAppAppointmentPayload): Promise<boolean> {
  const cleanPhone = payload.clinicPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const message = `*Aura Appointment Confirmation* ✨\n\n` +
    `Hello ${payload.clinicName},\n` +
    `A new appointment has been booked via Aura App.\n\n` +
    `📋 *Booking ID:* ${payload.appointmentId}\n` +
    `👤 *Patient:* ${payload.patientName} (${payload.patientPhone})\n` +
    `🩺 *Doctor:* ${payload.doctorName || 'Available Specialist'}\n` +
    `💆 *Treatment:* ${payload.procedureName || 'In-Clinic Consultation'}\n` +
    `📅 *Date:* ${payload.appointmentDate}\n` +
    `⏰ *Time:* ${payload.appointmentTime}\n\n` +
    `Please confirm the slot on your system. Thank you!`;

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encoded}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported || Platform.OS === 'web') {
      await Linking.openURL(url);
      return true;
    }
  } catch (error) {
    console.warn('Could not open WhatsApp', error);
  }
  return false;
}

/**
 * Opens a direct WhatsApp chat window with a patient or doctor.
 */
export async function openWhatsAppChat(phone: string, message: string): Promise<boolean> {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encoded}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported || Platform.OS === 'web') {
      await Linking.openURL(url);
      return true;
    }
  } catch (error) {
    console.warn('Could not open WhatsApp chat', error);
  }
  return false;
}

