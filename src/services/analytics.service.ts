export type AnalyticsEvent =
  | 'app_opened'
  | 'search_performed'
  | 'procedure_viewed'
  | 'clinic_viewed'
  | 'doctor_viewed'
  | 'booking_started'
  | 'booking_step_completed'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'not_sure_flow_started'
  | 'concern_selected'
  | 'concern_options_viewed'
  | 'clinic_saved'
  | 'procedure_saved';

export const analytics = {
  track: (event: AnalyticsEvent, properties?: Record<string, any>) => {
    if (__DEV__) {
      console.log(`[📊 Analytics Track] ${event}:`, properties ? JSON.stringify(properties) : '');
    }
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (__DEV__) {
      console.log(`[📊 Analytics Identify] ${userId}:`, traits);
    }
  },
};
