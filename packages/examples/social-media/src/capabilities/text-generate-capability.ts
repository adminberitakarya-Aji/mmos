/**
 * MMOS Social Media - Text Generate Capability Stub
 */

import type { CampaignBrief, AudienceProfile, CaptionResult } from '../types.js';

export interface TextGenerateInput {
  type: 'caption' | 'cta';
  campaign: CampaignBrief;
  audience: AudienceProfile;
  platform?: string;
}

export interface TextGenerateCapability {
  generate(input: TextGenerateInput): Promise<CaptionResult | string>;
}

export function createTextGenerateCapability(): TextGenerateCapability {
  return {
    async generate(input: TextGenerateInput): Promise<CaptionResult | string> {
      const { type, campaign, audience } = input;
      
      console.log(`[TextGenerateCapability] Generating ${type}`);
      
      if (type === 'cta') {
        return '🔥 Mulai transformasi digital bisnis Anda sekarang!\n\nKlik link di bio atauDM kami untuk konsultasi gratis!\n\n#AIStudio #UMKM #DigitalTransformation';
      }
      
      // Generate captions
      const captions = [
        `✨ Pernahkah Anda membayangkan bisnis Anda dikelola dengan AI? Sekarang bukan lagi mimpi!

${campaign.keyMessages[0]}
${campaign.keyMessages[1]}

📌 Mulai dari ${campaign.keyMessages[2]}
🎯 ${campaign.keyMessages[3]}

Link di bio untuk info lebih lanjut!`,

        `💡 Rahasia bisnis sukses di era digital?

Semua bermula dari satu langkah - mulai menggunakan AI dalam operasional bisnis Anda.

Dengan AI Studio, Anda bisa:
✓ ${campaign.keyMessages[4]}
✓ ${campaign.keyMessages[1]}
✓ ${campaign.keyMessages[0]}

Mulai ${campaign.keyMessages[2]} - tanpa perlu jadi programmer!

Klik link di bio 🚀`,

        `🚀 Transformasi bisnis tidak harus mahal & rumit!

AI Studio hadir untuk ${campaign.audience || 'UMKM Indonesia'} dengan solusi AI yang:

✅ Mudah digunakan
✅ Terjangkau
✅ Langsung bisa diterapkan

${campaign.keyMessages[2]}
${campaign.keyMessages[3]}

Konsultasi GRATIS? DM sekarang!`,
      ];
      
      return {
        captions,
        tone: audience.preferences.tone,
      };
    },
  };
}