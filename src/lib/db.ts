import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Candidate, StaffMember, DepartmentHealth, SystemStats, CandidateStatus, StaffStatus } from './types';

// Check if Supabase credentials are configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client, falling back to memory store:', err);
  }
}

// =========================================================
// IN-MEMORY / DEMO STORE FALLBACK (Safe for initial preview & dev)
// =========================================================
const initialCandidates: Candidate[] = [
  {
    id: 'c-1',
    ign: 'Grian',
    rating: 5,
    notes: 'Exceptional mega-builder with 8 years of survival experience. Very mature, polite on mic. Clear microphone and understands lore rules.',
    interviewer_ign: 'Avery_Dev',
    status: 'accepted',
    tags: ['Builder', 'Active', 'Good Mic', 'Chill'],
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'c-2',
    ign: 'MumboJumbo',
    rating: 5,
    notes: 'Legendary redstone engineer. Demonstrated piston door vault and automated farm layouts. Super polite and high community vibe.',
    interviewer_ign: 'Kev_Owner',
    status: 'accepted',
    tags: ['Redstone', 'Active', 'Good Mic'],
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'c-3',
    ign: 'TechnoBlade99',
    rating: 4,
    notes: 'Skilled PvP player, active community member. Wants to participate in tournaments. Good mic, casual schedule.',
    interviewer_ign: 'Sarah_Mod',
    status: 'pending',
    tags: ['PvP', 'Active'],
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'c-4',
    ign: 'GrieferTroll12',
    rating: 1,
    notes: 'Refused to read server rules. Questioned ban policies aggressively. Poor mic quality and background echo. Do not accept.',
    interviewer_ign: 'Sarah_Mod',
    status: 'rejected',
    tags: ['Toxic', 'Rule Issues'],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'c-5',
    ign: 'PixelCraftie',
    rating: 3,
    notes: 'Friendly builder, decent answers to lore questions. However, only plays 1-2 hours on weekends. Decent mic.',
    interviewer_ign: 'Avery_Dev',
    status: 'pending',
    tags: ['Casual', 'Builder'],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

const initialStaff: StaffMember[] = [
  {
    id: 's-1',
    ign: 'Kev_Owner',
    discord_tag: 'kev_owner#0001',
    role: 'Owner',
    department: 'Management & Leadership',
    status: 'Active',
    pin: '1234', // Default PIN for initial demo owner
    loa_reason: null,
    loa_return_date: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 's-2',
    ign: 'Avery_Dev',
    discord_tag: 'avery.dev#1337',
    role: 'Developer',
    department: 'Development & Tech',
    status: 'Active',
    pin: '1234', // Default PIN for initial demo dev
    loa_reason: null,
    loa_return_date: null,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 's-3',
    ign: 'Sarah_Mod',
    discord_tag: 'sarah_staff#4421',
    role: 'Moderator',
    department: 'Server Moderation',
    status: 'Active',
    loa_reason: null,
    loa_return_date: null,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 's-4',
    ign: 'PixelWatcher',
    discord_tag: 'pixel_mod#8899',
    role: 'Moderator',
    department: 'Server Moderation',
    status: 'LOA',
    loa_reason: 'College midterm exams and study week',
    loa_return_date: '2026-09-25',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-09-08T00:00:00Z',
  },
  {
    id: 's-5',
    ign: 'BlockDoctor',
    discord_tag: 'blockdoc#2211',
    role: 'Interviewer',
    department: 'Recruitment & Interviews',
    status: 'Active',
    loa_reason: null,
    loa_return_date: null,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 's-6',
    ign: 'InterviewPro',
    discord_tag: 'interviewer_sam#9021',
    role: 'Interviewer',
    department: 'Recruitment & Interviews',
    status: 'Hiatus',
    loa_reason: 'Moving apartments and awaiting ISP fiber installation',
    loa_return_date: '2026-09-20',
    created_at: '2026-03-15T00:00:00Z',
    updated_at: '2026-09-05T00:00:00Z',
  },
  {
    id: 's-7',
    ign: 'EchoVoice',
    discord_tag: 'echovoice#7712',
    role: 'Interviewer',
    department: 'Recruitment & Interviews',
    status: 'LOA',
    loa_reason: 'Medical recovery leave',
    loa_return_date: '2026-10-01',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-09-02T00:00:00Z',
  },
  {
    id: 's-8',
    ign: 'MasterBuilderBob',
    discord_tag: 'bobbuilds#6632',
    role: 'Builder',
    department: 'Building & World Design',
    status: 'Active',
    loa_reason: null,
    loa_return_date: null,
    created_at: '2026-04-15T00:00:00Z',
    updated_at: '2026-04-15T00:00:00Z',
  }
];

export const DEPARTMENTS_CONFIG = [
  { id: 'recruitment', name: 'Recruitment & Interviews', min_required_staff: 3 },
  { id: 'moderation', name: 'Server Moderation', min_required_staff: 4 },
  { id: 'development', name: 'Development & Tech', min_required_staff: 2 },
  { id: 'building', name: 'Building & World Design', min_required_staff: 2 },
  { id: 'events', name: 'Community & Events', min_required_staff: 2 },
];

// Global in-memory cache for serverless lifecycle
let memoryCandidates: Candidate[] = [...initialCandidates];
let memoryStaff: StaffMember[] = [...initialStaff];

// =========================================================
// CANDIDATES DATABASE ACCESS
// =========================================================

export async function getCandidates(filters?: {
  status?: string;
  minRating?: number;
  search?: string;
  interviewer?: string;
  sort?: 'newest' | 'oldest' | 'rating_desc' | 'rating_asc';
}): Promise<Candidate[]> {
  if (supabase) {
    let query = supabase.from('candidates').select('*');
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    if (filters?.interviewer) {
      query = query.eq('interviewer_ign', filters.interviewer);
    }
    if (filters?.search) {
      query = query.or(`ign.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    if (filters?.sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (filters?.sort === 'rating_desc') {
      query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
    } else if (filters?.sort === 'rating_asc') {
      query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (!error && data) return data as Candidate[];
  }

  // Memory fallback
  let list = [...memoryCandidates];
  if (filters?.status && filters.status !== 'all') {
    list = list.filter(c => c.status === filters.status);
  }
  if (filters?.minRating) {
    list = list.filter(c => c.rating >= filters.minRating!);
  }
  if (filters?.interviewer) {
    list = list.filter(c => c.interviewer_ign.toLowerCase() === filters.interviewer!.toLowerCase());
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(c => c.ign.toLowerCase().includes(q) || (c.notes && c.notes.toLowerCase().includes(q)));
  }

  if (filters?.sort === 'oldest') {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (filters?.sort === 'rating_desc') {
    list.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (filters?.sort === 'rating_asc') {
    list.sort((a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return list;
}

export async function createCandidate(data: {
  ign: string;
  rating: number;
  notes: string;
  interviewer_ign?: string;
  tags?: string[];
}): Promise<Candidate> {
  const newCandidate: Candidate = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ign: data.ign.trim(),
    rating: Math.max(1, Math.min(5, Number(data.rating) || 1)),
    notes: data.notes || '',
    interviewer_ign: data.interviewer_ign?.trim() || 'Staff',
    status: 'pending',
    tags: data.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data: inserted, error } = await supabase.from('candidates').insert({
      ign: newCandidate.ign,
      rating: newCandidate.rating,
      notes: newCandidate.notes,
      interviewer_ign: newCandidate.interviewer_ign,
      status: newCandidate.status,
      tags: newCandidate.tags,
    }).select().single();

    if (!error && inserted) return inserted as Candidate;
  }

  memoryCandidates.unshift(newCandidate);
  return newCandidate;
}

export async function updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | null> {
  if (supabase) {
    const { data, error } = await supabase.from('candidates').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single();

    if (!error && data) return data as Candidate;
  }

  const idx = memoryCandidates.findIndex(c => c.id === id);
  if (idx === -1) return null;

  memoryCandidates[idx] = {
    ...memoryCandidates[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return memoryCandidates[idx];
}

export async function deleteCandidate(id: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (!error) return true;
  }

  const initialLength = memoryCandidates.length;
  memoryCandidates = memoryCandidates.filter(c => c.id !== id);
  return memoryCandidates.length < initialLength;
}

// =========================================================
// STAFF MEMBERS DATABASE ACCESS
// =========================================================

export async function getStaff(filters?: {
  department?: string;
  status?: string;
  search?: string;
}): Promise<StaffMember[]> {
  if (supabase) {
    let query = supabase.from('staff').select('*');
    if (filters?.department && filters.department !== 'all') {
      query = query.eq('department', filters.department);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`ign.ilike.%${filters.search}%,discord_tag.ilike.%${filters.search}%`);
    }
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (!error && data) return data as StaffMember[];
  }

  let list = [...memoryStaff];
  if (filters?.department && filters.department !== 'all') {
    list = list.filter(s => s.department.toLowerCase() === filters.department!.toLowerCase());
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter(s => s.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(s => s.ign.toLowerCase().includes(q) || (s.discord_tag && s.discord_tag.toLowerCase().includes(q)));
  }

  return list;
}

export async function createStaff(data: {
  ign: string;
  discord_tag?: string;
  role: StaffMember['role'];
  department: string;
  status?: StaffStatus;
  loa_reason?: string;
  loa_return_date?: string;
}): Promise<StaffMember> {
  const newStaff: StaffMember = {
    id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ign: data.ign.trim(),
    discord_tag: data.discord_tag?.trim() || '',
    role: data.role,
    department: data.department.trim(),
    status: data.status || 'Active',
    loa_reason: data.loa_reason || null,
    loa_return_date: data.loa_return_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data: inserted, error } = await supabase.from('staff').insert({
      ign: newStaff.ign,
      discord_tag: newStaff.discord_tag,
      role: newStaff.role,
      department: newStaff.department,
      status: newStaff.status,
      loa_reason: newStaff.loa_reason,
      loa_return_date: newStaff.loa_return_date,
    }).select().single();

    if (!error && inserted) return inserted as StaffMember;
  }

  memoryStaff.unshift(newStaff);
  return newStaff;
}

export async function updateStaff(id: string, updates: Partial<StaffMember>): Promise<StaffMember | null> {
  if (supabase) {
    const { data, error } = await supabase.from('staff').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', id).select().single();

    if (!error && data) return data as StaffMember;
  }

  const idx = memoryStaff.findIndex(s => s.id === id);
  if (idx === -1) return null;

  memoryStaff[idx] = {
    ...memoryStaff[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return memoryStaff[idx];
}

export async function deleteStaff(id: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (!error) return true;
  }

  const initialLength = memoryStaff.length;
  memoryStaff = memoryStaff.filter(s => s.id !== id);
  return memoryStaff.length < initialLength;
}

// =========================================================
// DEPARTMENT HEALTH & DEFICIENCY TRACKER
// =========================================================

export async function getDepartmentsHealth(): Promise<DepartmentHealth[]> {
  const allStaff = await getStaff();

  return DEPARTMENTS_CONFIG.map(dept => {
    const deptStaff = allStaff.filter(s => s.department.toLowerCase() === dept.name.toLowerCase() || s.department.toLowerCase() === dept.id.toLowerCase());
    const total_staff = deptStaff.length;
    const active_staff = deptStaff.filter(s => s.status === 'Active').length;
    const loa_staff = deptStaff.filter(s => s.status === 'LOA').length;
    const hiatus_staff = deptStaff.filter(s => s.status === 'Hiatus').length;
    const is_lacking = active_staff < dept.min_required_staff;
    const deficiency_count = is_lacking ? dept.min_required_staff - active_staff : 0;

    return {
      id: dept.id,
      name: dept.name,
      min_required_staff: dept.min_required_staff,
      total_staff,
      active_staff,
      loa_staff,
      hiatus_staff,
      is_lacking,
      deficiency_count,
    };
  });
}

// =========================================================
// SYSTEM STATS & WHITELIST UTILS
// =========================================================

export async function getStats(): Promise<SystemStats> {
  const candidates = await getCandidates();
  const staff = await getStaff();
  const deptHealth = await getDepartmentsHealth();

  const total = candidates.length;
  const accepted = candidates.filter(c => c.status === 'accepted').length;
  const pending = candidates.filter(c => c.status === 'pending').length;
  const rejected = candidates.filter(c => c.status === 'rejected').length;
  const avgRating = total > 0 ? Number((candidates.reduce((sum, c) => sum + c.rating, 0) / total).toFixed(1)) : 0;

  const staffActive = staff.filter(s => s.status === 'Active').length;
  const staffLoa = staff.filter(s => s.status === 'LOA').length;
  const staffHiatus = staff.filter(s => s.status === 'Hiatus').length;
  const lackingDepartmentsCount = deptHealth.filter(d => d.is_lacking).length;

  return {
    candidates: { total, accepted, pending, rejected, avgRating },
    staff: {
      total: staff.length,
      active: staffActive,
      loa: staffLoa,
      hiatus: staffHiatus,
      lackingDepartmentsCount,
    },
  };
}

export async function getAcceptedWhitelist(): Promise<{ ignList: string[]; commands: string[]; json: any[] }> {
  const candidates = await getCandidates({ status: 'accepted' });
  const ignList = candidates.map(c => c.ign);
  const commands = ignList.map(ign => `/whitelist add ${ign}`);
  const json = ignList.map(ign => ({
    name: ign,
  }));

  return { ignList, commands, json };
}

// =========================================================
// DISCORD & PIN AUTHENTICATION HELPERS
// =========================================================

function normalizeDiscord(tag: string): string {
  return tag.trim().toLowerCase().replace(/^@/, '');
}

export async function findStaffByDiscord(discordTag: string): Promise<StaffMember | null> {
  const normalized = normalizeDiscord(discordTag);
  const staff = await getStaff();
  
  return staff.find(s => {
    const sTag = normalizeDiscord(s.discord_tag);
    return sTag === normalized || sTag.split('#')[0] === normalized;
  }) || null;
}

export async function setStaffPin(id: string, pin: string): Promise<StaffMember | null> {
  return updateStaff(id, { pin: pin.trim() });
}

export async function resetStaffPin(id: string): Promise<StaffMember | null> {
  return updateStaff(id, { pin: null });
}

