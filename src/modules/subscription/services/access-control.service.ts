@Injectable()
export class AccessControlService {
  async hasFeature(userId: number, feature: string): Promise<boolean> {
    const sub = await this.subRepo.findOne({
      where: { user: { id: userId } },
      relations: ['tier']
    });
    return sub?.tier?.features?.includes(feature) ?? false;
  }
}
