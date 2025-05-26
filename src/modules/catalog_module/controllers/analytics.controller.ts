@Get('genre-distribution')
getGenreDistribution() {
  return this.analyticsService.getGenreDistribution();
}
