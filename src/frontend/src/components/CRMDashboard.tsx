import type { Contact } from "@/backend";
import { Stage } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  Building2,
  Flame,
  Loader2,
  Mail,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getContactId(c: Contact): bigint {
  if (c.__kind__ === "active") return c.active.id;
  if (c.__kind__ === "lead") return c.lead.id;
  return c.inactive.id;
}

function getContactData(c: Contact) {
  if (c.__kind__ === "active")
    return { ...c.active, status: "active" as const };
  if (c.__kind__ === "lead") return { ...c.lead, status: "lead" as const };
  return { ...c.inactive, status: "inactive" as const, stage: undefined };
}

const STAGE_LABELS: Record<Stage, string> = {
  [Stage.New]: "New",
  [Stage.Contacted]: "Contacted",
  [Stage.Qualified]: "Qualified",
  [Stage.Proposal]: "Proposal",
  [Stage.ClosedWon]: "Closed Won",
  [Stage.ClosedLost]: "Closed Lost",
};

const STAGE_COLORS: Record<Stage, string> = {
  [Stage.New]: "bg-blue-100 text-blue-700 border-blue-200",
  [Stage.Contacted]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [Stage.Qualified]: "bg-purple-100 text-purple-700 border-purple-200",
  [Stage.Proposal]: "bg-orange-100 text-orange-700 border-orange-200",
  [Stage.ClosedWon]: "bg-green-100 text-green-700 border-green-200",
  [Stage.ClosedLost]: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lead: "bg-sky-100 text-sky-700 border-sky-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
};

// ─── Add/Edit Contact Modal ───────────────────────────────────────────────────
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "lead" | "inactive";
  stage: Stage;
}

const DEFAULT_FORM: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "lead",
  stage: Stage.New,
};

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function AddContactModal({ open, onClose, onSaved }: AddContactModalProps) {
  const { actor } = useActor();
  const [form, setForm] = useState<ContactFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ContactFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!actor || !form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      const id = await actor.addContact(
        form.name.trim(),
        form.email.trim(),
        form.phone.trim(),
        form.company.trim(),
      );
      if (form.status === "lead" && form.stage !== Stage.New) {
        await actor.updateContactStage(id, form.stage);
      }
      if (form.status === "inactive") {
        await actor.setContactInactive(id);
      }
      toast.success("Contact added successfully");
      setForm(DEFAULT_FORM);
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="crm.add_contact.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name *</Label>
              <Input
                data-ocid="crm.contact_name.input"
                placeholder="Priya Sharma"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                data-ocid="crm.contact_email.input"
                type="email"
                placeholder="priya@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                data-ocid="crm.contact_phone.input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Company</Label>
              <Input
                data-ocid="crm.contact_company.input"
                placeholder="TechCorp India Pvt. Ltd."
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger data-ocid="crm.contact_status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.status === "lead" && (
              <div className="space-y-1.5">
                <Label>Stage</Label>
                <Select
                  value={form.stage}
                  onValueChange={(v) => set("stage", v as Stage)}
                >
                  <SelectTrigger data-ocid="crm.contact_stage.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Stage).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            data-ocid="crm.add_contact.cancel_button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            data-ocid="crm.add_contact.submit_button"
            onClick={handleSubmit}
            disabled={saving || !form.name.trim() || !form.email.trim()}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Adding..." : "Add Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Note Modal ────────────────────────────────────────────────────────────
interface AddNoteModalProps {
  contactId: bigint | null;
  contactName: string;
  onClose: () => void;
  onSaved: () => void;
}

function AddNoteModal({
  contactId,
  contactName,
  onClose,
  onSaved,
}: AddNoteModalProps) {
  const { actor } = useActor();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!actor || contactId === null || !note.trim()) return;
    setSaving(true);
    try {
      await actor.addNote(contactId, note.trim());
      toast.success("Note added");
      setNote("");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={contactId !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="crm.add_note.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Note — {contactName}</DialogTitle>
        </DialogHeader>
        <Textarea
          data-ocid="crm.note.textarea"
          placeholder="Write your note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <DialogFooter>
          <Button
            variant="outline"
            data-ocid="crm.add_note.cancel_button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            data-ocid="crm.add_note.submit_button"
            onClick={handleSubmit}
            disabled={saving || !note.trim()}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Pipeline Board ───────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  Stage.New,
  Stage.Contacted,
  Stage.Qualified,
  Stage.Proposal,
  Stage.ClosedWon,
  Stage.ClosedLost,
];

interface PipelineBoardProps {
  contacts: Contact[];
  onStageChange: (id: bigint, stage: Stage) => Promise<void>;
  onNote: (id: bigint, name: string) => void;
}

function PipelineBoard({
  contacts,
  onStageChange,
  onNote,
}: PipelineBoardProps) {
  const leads = contacts.filter((c) => c.__kind__ === "lead");

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const cards = leads.filter(
            (c) => c.__kind__ === "lead" && c.lead.stage === stage,
          );
          return (
            <div key={stage} className="w-48 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STAGE_COLORS[stage]}`}
                >
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                <AnimatePresence>
                  {cards.map((c) => {
                    const d = getContactData(c);
                    return (
                      <motion.div
                        key={d.id.toString()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="shadow-sm border border-border">
                          <CardContent className="p-3 space-y-2">
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {d.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {d.company}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              {PIPELINE_STAGES.filter((s) => s !== stage).map(
                                (s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    data-ocid="crm.pipeline.stage.button"
                                    onClick={() => onStageChange(d.id, s)}
                                    className="text-[10px] px-1.5 py-0.5 rounded border bg-muted hover:bg-accent text-muted-foreground transition-colors"
                                    title={`Move to ${STAGE_LABELS[s]}`}
                                  >
                                    → {STAGE_LABELS[s]}
                                  </button>
                                ),
                              )}
                            </div>
                            <button
                              type="button"
                              data-ocid="crm.pipeline.note.button"
                              onClick={() => onNote(d.id, d.name)}
                              className="text-[10px] text-primary hover:underline flex items-center gap-1"
                            >
                              <StickyNote className="w-3 h-3" /> Add note
                            </button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {cards.length === 0 && (
                  <div
                    data-ocid="crm.pipeline.empty_state"
                    className="text-xs text-muted-foreground/50 text-center py-4 border border-dashed border-border rounded-lg"
                  >
                    No leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CRM Dashboard ────────────────────────────────────────────────────────────
export default function CRMDashboard() {
  const { actor, isFetching } = useActor();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<{
    totalContacts: bigint;
    newLeads: bigint;
    qualified: bigint;
    closedWon: bigint;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{
    id: bigint;
    name: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [activeTab, setActiveTab] = useState<"contacts" | "pipeline">(
    "contacts",
  );

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [all, s] = await Promise.all([
        actor.getAllContacts(),
        actor.getStats(),
      ]);
      setContacts(all);
      setStats(s);
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!isFetching && actor) load();
  }, [actor, isFetching, load]);

  const handleDelete = async (c: Contact) => {
    if (!actor) return;
    const id = getContactId(c);
    setDeletingId(id);
    try {
      await actor.deleteContact(id);
      toast.success("Contact deleted");
      await load();
    } catch {
      toast.error("Failed to delete contact");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStageChange = async (id: bigint, stage: Stage) => {
    if (!actor) return;
    try {
      await actor.updateContactStage(id, stage);
      toast.success(`Moved to ${STAGE_LABELS[stage]}`);
      await load();
    } catch {
      toast.error("Failed to update stage");
    }
  };

  const statCards = [
    {
      label: "Total Contacts",
      value: stats?.totalContacts ?? 0n,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "New Leads",
      value: stats?.newLeads ?? 0n,
      icon: Flame,
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
    {
      label: "Qualified",
      value: stats?.qualified ?? 0n,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Closed Won",
      value: stats?.closedWon ?? 0n,
      icon: Trophy,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">CRM</h2>
            <p className="text-muted-foreground text-sm">
              Shivakrya Mission — Customer Relationships
            </p>
          </div>
          <Button
            data-ocid="crm.add_contact.open_modal_button"
            onClick={() => setAddOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                data-ocid={`crm.stats.card.${i + 1}`}
                className="shadow-card border-border"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {value.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(["contacts", "pipeline"] as const).map((t) => (
            <button
              key={t}
              type="button"
              data-ocid={`crm.${t}.tab`}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${
                activeTab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "pipeline" ? "Lead Pipeline" : "All Contacts"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading || isFetching ? (
          <div
            data-ocid="crm.loading_state"
            className="flex justify-center py-16"
          >
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeTab === "contacts" ? (
          <Card className="shadow-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Contacts ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {contacts.length === 0 ? (
                <div
                  data-ocid="crm.contacts.empty_state"
                  className="text-center py-16 text-muted-foreground"
                >
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No contacts yet</p>
                  <p className="text-sm">
                    Add your first contact to get started.
                  </p>
                </div>
              ) : (
                <Table data-ocid="crm.contacts.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Company
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Phone
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c, idx) => {
                      const d = getContactData(c);
                      return (
                        <TableRow
                          key={d.id.toString()}
                          data-ocid={`crm.contacts.item.${idx + 1}`}
                        >
                          <TableCell>
                            <div className="font-semibold text-foreground text-sm">
                              {d.name}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {d.company}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5" />
                              {d.company || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              {d.email}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {d.phone || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className={`text-xs w-fit capitalize ${
                                  STATUS_COLORS[d.status]
                                }`}
                              >
                                {d.status}
                              </Badge>
                              {c.__kind__ === "lead" && c.lead.stage && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs w-fit ${
                                    STAGE_COLORS[c.lead.stage]
                                  }`}
                                >
                                  {STAGE_LABELS[c.lead.stage]}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid={`crm.contacts.note.button.${idx + 1}`}
                                onClick={() =>
                                  setNoteTarget({ id: d.id, name: d.name })
                                }
                                className="h-7 px-2 text-xs"
                              >
                                <StickyNote className="w-3.5 h-3.5 mr-1" />
                                Note
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid={`crm.contacts.delete_button.${idx + 1}`}
                                onClick={() => handleDelete(c)}
                                disabled={deletingId === d.id}
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {deletingId === d.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">
                Lead Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineBoard
                contacts={contacts}
                onStageChange={handleStageChange}
                onNote={(id, name) => setNoteTarget({ id, name })}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <AddContactModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={load}
      />
      <AddNoteModal
        contactId={noteTarget?.id ?? null}
        contactName={noteTarget?.name ?? ""}
        onClose={() => setNoteTarget(null)}
        onSaved={load}
      />
    </section>
  );
}
