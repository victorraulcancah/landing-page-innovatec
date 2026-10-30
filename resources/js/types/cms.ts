export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'richtext' | 'richline' | 'toggle' | 'select' | 'color' | 'image' | 'cta' | 'list' | 'number';
    max?: number;
    min?: number;
    options?: Record<string, string>;
    actions?: Record<string, string>;
    fields?: FieldDef[];
    itemLabel?: string;
}

export interface SectionTypeDef {
    label: string;
    description: string;
    content: FieldDef[];
    style: FieldDef[];
    defaults: Record<string, Json>;
}

export type SectionSchema = Record<string, SectionTypeDef>;

export type Cta = {
    label: string;
    action: string;
    value: string;
};

export interface SectionStyle {
    bg_color: string | null;
    text_color: string | null;
    accent_color: string | null;
    align: 'left' | 'center' | 'right';
    padding: 'sm' | 'md' | 'lg';
    width: 'narrow' | 'normal' | 'wide';
    image_position: 'right' | 'left' | 'top';
    bg_image?: string | null;
    bg_overlay?: 'soft' | 'strong' | 'solid';
    image_tone?: 'natural' | 'brand';
}

export interface CampaignSectionData {
    id: number;
    type: string;
    position: number;
    is_visible: boolean;
    anchor: string | null;
    nav_label: string | null;
    content: Record<string, Json>;
    style: SectionStyle;
}

export interface CampaignData {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'active' | 'archived';
    meta_title: string | null;
    meta_description: string | null;
    theme: Partial<ThemeData> | null;
}

export type ThemeData = {
    primary: string;
    on_primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    dark: string;
    on_dark: string;
    heading_font: string;
    body_font: string;
    radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    motion: 'full' | 'subtle' | 'none';
};

export type NavbarData = {
    brand_text: string;
    brand_sub: string;
    logo: string | null;
    logo_position: 'left' | 'center';
    links_mode: 'auto' | 'manual';
    links_align: 'left' | 'center' | 'right';
    links: { label: string; target: string }[];
    show_cta: boolean;
    cta: Cta;
    bg_color: string | null;
    text_color: string | null;
    sticky: boolean;
    border: boolean;
};

export type ContactData = {
    whatsapp: string;
    whatsapp_message: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    map_url?: string;
    map_embed?: string;
    map_coords?: string;
};

export type FooterData = {
    text: string;
    legal: string;
    show_contact: boolean;
    bg_color: string | null;
    text_color: string | null;
};

export interface FlashProps {
    success?: string | null;
    error?: string | null;
    lead_sent?: boolean;
}
