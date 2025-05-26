# Wellness Module API Documentation

## Overview

The Wellness Module provides comprehensive therapeutic and wellness features for your music platform, including mood-based recommendations, guided meditation, frequency therapy, and wellness analytics.

## Features

### 1. Wellness Categories & Programs
- **Therapeutic Categories**: Anxiety relief, depression support, stress reduction, sleep improvement, etc.
- **Program Types**: Guided meditation, music therapy, frequency therapy, breathwork
- **Difficulty Levels**: Beginner, intermediate, advanced

### 2. Mood-Based Music Recommendations
- **Mood Tracking**: Users can log their current mood, energy, and stress levels
- **Smart Recommendations**: AI-powered music suggestions based on current emotional state
- **Mood Analytics**: Track mood trends and improvements over time

### 3. Guided Meditation with Music
- **Session Tracking**: Complete meditation session management
- **Progress Monitoring**: Track completion rates, streaks, and improvements
- **Integration**: Seamlessly integrates with your existing music catalog

### 4. Binaural Beats & Frequency Therapy
- **Scientific Frequencies**: Solfeggio frequencies, binaural beats, chakra frequencies
- **Brainwave States**: Target specific states (delta, theta, alpha, beta, gamma)
- **Therapeutic Applications**: Sleep, focus, anxiety relief, pain management

### 5. Wellness Program Tracking
- **Progress Monitoring**: Track user progress through wellness programs
- **Streak Tracking**: Maintain motivation with streak counters
- **Completion Analytics**: Detailed completion statistics

### 6. Certified Therapist Directory
- **Verified Professionals**: Directory of certified music therapists and wellness professionals
- **Specialization Search**: Find therapists by specialty, certification level, and experience
- **Rating System**: User reviews and ratings for therapists

### 7. Wellness Analytics & Outcomes
- **Comprehensive Reports**: Detailed wellness reports with trends and insights
- **Outcome Tracking**: Measure improvements in mood, stress, sleep quality, etc.
- **Data-Driven Insights**: Help users understand their wellness journey

## API Endpoints

### Wellness Categories
\`\`\`
GET /wellness/categories - Get all wellness categories
GET /wellness/programs - Get all wellness programs
GET /wellness/programs/category/:categoryId - Get programs by category
POST /wellness/programs - Create new wellness program
\`\`\`

### Mood & Recommendations
\`\`\`
POST /wellness/mood/entry - Log mood entry
GET /wellness/mood/history - Get mood history
GET /wellness/mood/recommendations - Get music recommendations based on mood
GET /wellness/mood/analytics - Get mood analytics and trends
\`\`\`

### Meditation Sessions
\`\`\`
POST /wellness/meditation/sessions - Start meditation session
PUT /wellness/meditation/sessions/:sessionId - Update session
GET /wellness/meditation/sessions - Get user's meditation sessions
GET /wellness/meditation/stats - Get meditation statistics
\`\`\`

### Frequency Therapy
\`\`\`
GET /wellness/frequency-therapy - Get all frequency therapies
GET /wellness/frequency-therapy/type/:type - Get by frequency type
GET /wellness/frequency-therapy/brainwave/:state - Get by brainwave state
GET /wellness/frequency-therapy/binaural-beats/:targetState - Get binaural beats recommendations
\`\`\`

### Therapist Directory
\`\`\`
GET /wellness/therapists - Get all verified therapists
GET /wellness/therapists/specialty/:specialty - Get therapists by specialty
GET /wellness/therapists/search - Search therapists with filters
PUT /wellness/therapists/:id/rating - Update therapist rating
\`\`\`

### Analytics
\`\`\`
GET /wellness/analytics/report - Get comprehensive wellness report
POST /wellness/analytics/outcomes - Record wellness outcome
GET /wellness/analytics/popular-programs - Get popular programs
\`\`\`

## Data Models

### Therapeutic Categories
- Anxiety Relief
- Depression Support
- Stress Reduction
- Sleep Improvement
- Focus Enhancement
- Pain Management
- Emotional Healing
- Trauma Recovery
- Addiction Recovery
- Mindfulness
- Meditation
- Breathwork
- Binaural Beats
- Frequency Therapy

### Frequency Types
- **Binaural Beats**: Different frequencies in each ear to create brainwave entrainment
- **Isochronic Tones**: Single tones that pulse on and off
- **Solfeggio Frequencies**: Ancient healing frequencies (396Hz, 528Hz, etc.)
- **Schumann Resonance**: Earth's natural frequency (7.83Hz)
- **Chakra Frequencies**: Frequencies associated with energy centers

### Brainwave States
- **Delta (0.5-4 Hz)**: Deep sleep, healing
- **Theta (4-8 Hz)**: Deep meditation, creativity
- **Alpha (8-13 Hz)**: Relaxed awareness, light meditation
- **Beta (13-30 Hz)**: Normal waking consciousness
- **Gamma (30-100 Hz)**: Higher consciousness, peak performance

## Integration with Existing Music Platform

The wellness module integrates seamlessly with your existing music infrastructure:

1. **Track Enhancement**: Existing tracks can be tagged with therapeutic properties
2. **Playlist Integration**: Wellness-focused playlists with therapeutic metadata
3. **User Profiles**: Wellness preferences and progress integrated with user accounts
4. **Analytics Integration**: Wellness metrics combined with music listening analytics

## Security & Privacy

- All wellness data is encrypted and HIPAA-compliant
- User mood and session data is anonymized for analytics
- Therapist verification includes credential validation
- Secure API endpoints with JWT authentication

## Getting Started

1. **Database Setup**: Run the wellness migrations to create required tables
2. **Seed Data**: Use the frequency therapy seeding endpoint to populate initial data
3. **Integration**: Connect wellness endpoints to your frontend application
4. **Therapist Onboarding**: Set up therapist verification process
5. **Analytics**: Configure wellness analytics dashboard

## Best Practices

1. **User Consent**: Always obtain user consent before collecting wellness data
2. **Professional Guidance**: Encourage users to consult healthcare professionals
3. **Data Privacy**: Implement strict data privacy measures for sensitive wellness information
4. **Accessibility**: Ensure wellness features are accessible to users with disabilities
5. **Scientific Accuracy**: Base frequency therapy recommendations on peer-reviewed research

## Support & Documentation

For additional support or questions about the wellness module implementation, please refer to the inline code documentation or contact the development team.
