import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  country?: string;
}

export interface CarImage {
  id: number;
  image_url: string;
  s3_key?: string;
  category: "exterior" | "interior" | "dashboard" | "wheels";
  sort_order: number;
  is_primary: boolean;
}

export interface Car {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
  stock_code?: string;
  vin?: string;
  price: number;
  monthly_installment?: number;
  year: number;
  body_type: string;
  fuel_type: string;
  transmission: string;
  drivetrain: string;
  odo_km: number;
  condition: "new" | "used";
  status: "available" | "reserved" | "sold";
  exterior_color?: string;
  interior?: string;
  description?: string;
  badge?: string;
  owners_count?: number;
  has_factory_warranty?: boolean;
  warranty_months?: number;
  specs?: Array<{ group: string; label: string; value: string }>;
  is_featured: boolean;
  images: CarImage[];
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  type: "consult" | "appraisal" | "consignment" | "installment" | "concierge" | "test_drive";
  status: "new" | "contacted" | "negotiating" | "won" | "lost";
  message?: string;
  interested_car_id?: number;
  interested_car_name?: string;
  created_at: string;
}

export interface StatsResponse {
  stats: {
    total_cars: number;
    available_cars: number;
    sold_cars: number;
    total_leads: number;
    new_leads: number;
    total_brands: number;
  };
  recent_leads: Lead[];
  recent_cars: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    year: number;
    status: string;
    primary_image?: string;
  }>;
}

// API Functions
export const adminApi = {
  // Stats
  getStats: async (): Promise<StatsResponse> => {
    const res = await api.get("/admin/stats");
    return res.data;
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    const res = await api.get("/brands/");
    return res.data;
  },
  createBrand: async (data: { name: string; slug: string; logo_url?: string; country?: string }): Promise<Brand> => {
    const res = await api.post("/brands/", data);
    return res.data;
  },
  deleteBrand: async (id: number) => {
    const res = await api.delete(`/brands/${id}`);
    return res.data;
  },

  // Cars
  getCars: async (params?: { page?: number; page_size?: number; search?: string; status?: string; brand_id?: number }) => {
    const res = await api.get("/cars/", { params });
    return res.data;
  },
  getCarById: async (id: number): Promise<Car> => {
    const res = await api.get(`/cars/id/${id}`);
    return res.data;
  },
  createCar: async (data: Partial<Car>): Promise<Car> => {
    const res = await api.post("/cars/", data);
    return res.data;
  },
  updateCar: async (id: number, data: Partial<Car>): Promise<Car> => {
    const res = await api.put(`/cars/${id}`, data);
    return res.data;
  },
  deleteCar: async (id: number) => {
    const res = await api.delete(`/cars/${id}`);
    return res.data;
  },
  updateImagesOrder: async (carId: number, items: Array<{ id: number; sort_order: number; is_primary: boolean }>) => {
    const res = await api.patch(`/cars/${carId}/images/order`, items);
    return res.data;
  },

  // Upload Images
  uploadCarImages: async (carId: number, category: string, files: File[]) => {
    const formData = new FormData();
    formData.append("car_id", carId.toString());
    formData.append("category", category);
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await api.post("/upload/car-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  deleteCarImage: async (imageId: number) => {
    const res = await api.delete(`/upload/car-images/${imageId}`);
    return res.data;
  },

  // Leads
  getLeads: async (params?: { type?: string; status?: string }): Promise<Lead[]> => {
    const res = await api.get("/leads/", { params });
    return res.data;
  },
  updateLeadStatus: async (id: number, status: string): Promise<Lead> => {
    const res = await api.patch(`/leads/${id}/status`, { status });
    return res.data;
  },
  getTestDrives: async () => {
    const res = await api.get("/leads/test-drives");
    return res.data;
  },
};
