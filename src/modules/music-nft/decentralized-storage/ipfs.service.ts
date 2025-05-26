import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class IPFSService {
  private readonly pinataApiKey = process.env.PINATA_API_KEY!;
  private readonly pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY!;

  async uploadMetadata(metadata: any): Promise<string> {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretApiKey,
        },
      }
    );
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  }

  async uploadFile(filePath: string): Promise<string> {
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath));

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data,
      {
        headers: {
          ...data.getHeaders(),
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretApiKey,
        },
      }
    );
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  }
}