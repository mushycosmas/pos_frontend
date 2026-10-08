import api from "./api";

const CompanyApi = {

  // =========================================================
  // GET COMPANIES
  // =========================================================

  getCompanies: async () => {
    const response = await api.get("/company/");
    return response.data;
  },

  // =========================================================
  // GET COMPANY
  // =========================================================

  getCompany: async (id) => {
    const response = await api.get(`/company/${id}/`);
    return response.data;
  },

  // =========================================================
  // CREATE COMPANY
  // =========================================================

  createCompany: async (data) => {
    const response = await api.post(
      "/company/",
      data
    );

    return response.data;
  },

  // =========================================================
  // UPDATE COMPANY INFORMATION
  // =========================================================

  updateCompany: async (id, data) => {

    const payload = {
      name: data.name || "",
      legal_name: data.legal_name || "",
      registration_number: data.registration_number || "",
      tax_number: data.tax_number || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || null,
      address: data.address || "",
      city: data.city || "",
      country: data.country || "Tanzania",
      currency: data.currency || "TZS",
      timezone: data.timezone || "Africa/Dar_es_Salaam",
      is_active:
        data.is_active !== undefined
          ? data.is_active
          : true,
    };

    const response = await api.patch(
      `/company/${id}/`,
      payload
    );

    return response.data;
  },

  // =========================================================
  // UPLOAD COMPANY LOGO
  // =========================================================

  uploadLogo: async (id, logoFile) => {

    if (!logoFile) {
      throw new Error("Logo file is required.");
    }

    const formData = new FormData();

    formData.append("logo", logoFile);

    const response = await api.patch(
      `/company/${id}/`,
      formData
    );

    return response.data;
  },

  // =========================================================
  // DELETE COMPANY
  // =========================================================

  deleteCompany: async (id) => {
    const response = await api.delete(
      `/company/${id}/`
    );

    return response.data;
  },
};

export default CompanyApi;
