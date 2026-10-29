import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn JWT token vào Header nếu đã đăng nhập
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("atelier_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Types
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  country?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  level: number;
  sort_order: number;
  parent_id?: number | null;
  cars_count?: number;
  children?: Category[];
}

export interface CarColor {
  id: number;
  car_id: number;
  name: string;
  hex_code: string;
  color_type: "standard" | "metallic" | "bespoke";
  price_delta: number;
  images: string[];
  sort_order: number;
  is_default: boolean;
}

export interface CarOption {
  id: number;
  car_id: number;
  group: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  is_standard: boolean;
  is_selected: boolean;
  sort_order: number;
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
  brand?: Brand;
  category_id?: number;
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
  is_inspected: boolean;
  is_featured: boolean;
  specs?: Array<{ group: string; label: string; value: string }>;
  images: CarImage[];
  colors?: CarColor[];
  options?: CarOption[];
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

export interface TestDrive {
  id: number;
  booking_code: string;
  status: string;
  appointment_date: string;
  time_slot: string;
  lead_id: number;
  car_id: number;
  car_name?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_url?: string;
  category?: string;
  is_published: boolean;
  published_at: string;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  page_size: number;
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

  // Categories
  getCategoryTree: async (): Promise<Category[]> => {
    const res = await api.get("/categories/tree");
    return res.data;
  },
  getCategories: async (params?: { level?: number; parent_id?: number }): Promise<Category[]> => {
    const res = await api.get("/categories/", { params });
    return res.data;
  },

  // Cars
  getCars: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    brand_id?: number;
    category_id?: number;
    body_type?: string;
    condition?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
  }) => {
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
  getTestDrives: async (): Promise<TestDrive[]> => {
    const res = await api.get("/leads/test-drives");
    return res.data;
  },

  // Posts / News & Articles
  getAdminPosts: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    is_published?: boolean;
  }): Promise<PostListResponse> => {
    const res = await api.get("/posts/admin/all", { params });
    return res.data;
  },
  getPostById: async (id: number): Promise<Post> => {
    const res = await api.get(`/posts/id/${id}`);
    return res.data;
  },
  createPost: async (data: Partial<Post>): Promise<Post> => {
    const res = await api.post("/posts/", data);
    return res.data;
  },
  updatePost: async (id: number, data: Partial<Post>): Promise<Post> => {
    const res = await api.put(`/posts/${id}`, data);
    return res.data;
  },
  deletePost: async (id: number) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
  uploadGeneralImage: async (file: File, folder: string = "articles"): Promise<{ url: string; file_id: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await api.post("/upload/general", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export interface AdminUser {
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AdminUser;
}

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.access_token && typeof window !== "undefined") {
      localStorage.setItem("atelier_admin_token", res.data.access_token);
      localStorage.setItem("atelier_admin_user", JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async (): Promise<AdminUser> => {
    const res = await api.get("/auth/me");
    return res.data;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("atelier_admin_token");
      localStorage.removeItem("atelier_admin_user");
    }
  },
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("atelier_admin_token");
    }
    return null;
  },
  getUser: (): AdminUser | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("atelier_admin_user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },
};
