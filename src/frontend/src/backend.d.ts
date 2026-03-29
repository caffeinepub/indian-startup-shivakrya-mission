import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Contact = {
    __kind__: "active";
    active: {
        id: bigint;
        name: string;
        email: string;
        company: string;
        notes: Array<string>;
        phone: string;
    };
} | {
    __kind__: "lead";
    lead: {
        id: bigint;
        name: string;
        email: string;
        company: string;
        stage: Stage;
        notes: Array<string>;
        phone: string;
    };
} | {
    __kind__: "inactive";
    inactive: {
        id: bigint;
        name: string;
        email: string;
        company: string;
        notes: Array<string>;
        phone: string;
    };
};
export enum Stage {
    New = "New",
    Contacted = "Contacted",
    Qualified = "Qualified",
    Proposal = "Proposal",
    ClosedWon = "ClosedWon",
    ClosedLost = "ClosedLost"
}
export interface backendInterface {
    addContact(name: string, email: string, phone: string, company: string): Promise<bigint>;
    addNote(id: bigint, note: string): Promise<boolean>;
    convertLeadToActive(id: bigint): Promise<boolean>;
    convertStage(id: bigint, newStage: Stage): Promise<boolean>;
    countContactsByStage(stage: Stage): Promise<bigint>;
    deleteContact(id: bigint): Promise<boolean>;
    getActiveContacts(): Promise<Array<Contact>>;
    getAllContacts(): Promise<Array<Contact>>;
    getContact(id: bigint): Promise<Contact | null>;
    getContactCount(): Promise<bigint>;
    getContactsByStage(stage: Stage): Promise<Array<Contact>>;
    getInactiveContacts(): Promise<Array<Contact>>;
    getNextId(): Promise<bigint>;
    getStats(): Promise<{
        closedWon: bigint;
        totalContacts: bigint;
        newLeads: bigint;
        proposal: bigint;
        contacted: bigint;
        qualified: bigint;
        closedLost: bigint;
    }>;
    setContactInactive(id: bigint): Promise<boolean>;
    updateContact(id: bigint, contact: Contact): Promise<boolean>;
    updateContactStage(id: bigint, stage: Stage): Promise<boolean>;
}
