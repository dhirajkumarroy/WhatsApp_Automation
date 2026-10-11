export const BUSINESS_NAME = "Dhanush Technologies";

const publicUrl = (value = "") => {
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username && !url.password && url.href.length <= 250
      ? url.href : "";
  } catch {
    return "";
  }
};

export const getBusinessProfile = () => ({
  name: BUSINESS_NAME,
  website: publicUrl(process.env.BUSINESS_WEBSITE_URL),
  linkedin: publicUrl(process.env.BUSINESS_LINKEDIN_URL)
});

export const SERVICES = {
  website: {
    title: "Website Development",
    description: "Business websites, online stores and portfolios",
    details: "Business websites, landing pages, portfolios and online stores, with responsive design, enquiry forms, payments and admin panels as needed."
  },
  app: {
    title: "App Development",
    description: "Mobile apps and web applications for your business",
    details: "Mobile apps and web applications for your business, including customer accounts, bookings, payments, dashboards and API integrations."
  },
  automation: {
    title: "WhatsApp Automation",
    description: "Customer replies, enquiries and workflow automation",
    details: "WhatsApp enquiry bots, service menus, lead capture, customer support flows and CRM integrations. We can also build custom business workflows and approved message-template integrations."
  },
  custom: {
    title: "Custom Software",
    description: "CRMs, dashboards, business tools and integrations",
    details: "Custom CRMs, management systems, dashboards, internal tools and integrations built around your business process. Tell us the problem you want to solve."
  },
  infrastructure: {
    title: "Domain & Server Setup",
    description: "Domains, hosting, DNS, SSL and deployment",
    details: "Domain registration assistance, DNS configuration, hosting or cloud server setup, SSL, database configuration and deployment. We can also scope migration, backups and ongoing maintenance."
  },
  complete: {
    title: "Complete Project Setup",
    description: "From your idea to development, launch and handover",
    details: "One team for planning, design, website or app development, automation, domain and server setup, testing, deployment and handover. Ongoing support can be included in your agreed project scope."
  }
};
