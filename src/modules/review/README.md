# Review Module for NestJS Music Platform

## Overview
This module implements a review system for albums, tracks, merchandise, and events in a music platform. Features include:

- Adding reviews with star ratings and text.
- Verified purchase flag.
- Review moderation (pending, approved, rejected).
- Marking reviews as helpful/unhelpful.
- Artist responses to reviews.
- Basic analytics like average rating and review count.

## Entities
- `Review`: Main review entity.
- `ReviewHelpfulnessVote`: Records helpful/unhelpful votes per user per review.
- `ArtistResponse`: Artist replies to reviews.

## DTOs
- `CreateReviewDto`
- `VoteHelpfulnessDto`
- `ArtistResponseDto`

## Services
- `ReviewService`: Core CRUD and business logic.
- `ReviewAnalyticsService`: Provides aggregated statistics.

## Controllers
- `ReviewController`: Exposes HTTP endpoints for review operations.

## Usage
Register this module in your main app module and configure TypeORM accordingly.

---

This is a foundational module and should be extended with proper authorization, validation, and integration with user, content, and purchase systems.
