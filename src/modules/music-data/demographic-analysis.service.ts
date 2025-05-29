@Injectable()
export class DemographicAnalysisService {
  async analyzeDemographics(): Promise<any> {
    // Simulate demographic slice
    return {
      age: { '18-24': 32, '25-34': 45 },
      gender: { male: 60, female: 40 },
      location: { Lagos: 50, Abuja: 30, Kano: 20 }
    };
  }
}
