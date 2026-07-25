import axios from 'axios';

export interface GeoResult {
  lat: number;
  lng: number;
}

export class GeocodingService {
  async geocode(endereco: string, cidade?: string, uf?: string): Promise<GeoResult | null> {
    try {
      let query = endereco;
      if (cidade && cidade.trim()) {
        query += `, ${cidade.trim()}`;
      }
      if (uf && uf.trim()) {
        query += `, ${uf.trim()}`;
      }
      query += ', Brasil';

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'SuaColetoraApp/1.0',
        },
      });

      const data = response.data;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const result = data[0];
      const lat = Number(result.lat);
      const lng = Number(result.lon);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
      }

      return { lat, lng };
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }
}
