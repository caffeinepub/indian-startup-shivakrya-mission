import Migration "migration";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  type Stage = {
    #New;
    #Contacted;
    #Qualified;
    #Proposal;
    #ClosedWon;
    #ClosedLost;
  };

  type Contact = {
    #lead : {
      id : Nat;
      name : Text;
      email : Text;
      phone : Text;
      company : Text;
      notes : [Text];
      stage : Stage;
    };
    #active : {
      id : Nat;
      name : Text;
      email : Text;
      phone : Text;
      company : Text;
      notes : [Text];
    };
    #inactive : {
      id : Nat;
      name : Text;
      email : Text;
      phone : Text;
      company : Text;
      notes : [Text];
    };
  };

  let contacts = Map.empty<Nat, Contact>();
  var nextId = 1;

  public shared ({ caller }) func addContact(name : Text, email : Text, phone : Text, company : Text) : async Nat {
    let id = nextId;
    let contact : Contact = #lead({
      id;
      name;
      email;
      phone;
      company;
      notes = [];
      stage = #New;
    });
    contacts.add(id, contact);
    nextId += 1;
    id;
  };

  public query ({ caller }) func getContact(id : Nat) : async ?Contact {
    contacts.get(id);
  };

  public query ({ caller }) func getAllContacts() : async [Contact] {
    contacts.values().toArray();
  };

  public shared ({ caller }) func updateContact(id : Nat, contact : Contact) : async Bool {
    if (contacts.containsKey(id)) {
      contacts.add(id, contact);
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func deleteContact(id : Nat) : async Bool {
    if (contacts.containsKey(id)) {
      contacts.remove(id);
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func addNote(id : Nat, note : Text) : async Bool {
    switch (contacts.get(id)) {
      case (null) { false };
      case (?contact) {
        switch (contact) {
          case (#lead(data)) {
            let notesList = List.fromArray(data.notes);
            notesList.add(note);
            let newContact : Contact = #lead({
              data with
              notes = notesList.toArray();
            });
            contacts.add(id, newContact);
            true;
          };
          case (#active(data)) {
            let notesList = List.fromArray(data.notes);
            notesList.add(note);
            let newContact : Contact = #active({
              data with
              notes = notesList.toArray();
            });
            contacts.add(id, newContact);
            true;
          };
          case (#inactive(data)) {
            let notesList = List.fromArray(data.notes);
            notesList.add(note);
            let newContact : Contact = #inactive({
              data with
              notes = notesList.toArray();
            });
            contacts.add(id, newContact);
            true;
          };
        };
      };
    };
  };

  public query ({ caller }) func getContactsByStage(stage : Stage) : async [Contact] {
    let results = List.empty<Contact>();
    for ((_, contact) in contacts.entries()) {
      switch (contact) {
        case (#lead(data)) {
          if (data.stage == stage) {
            results.add(contact);
          };
        };
        case (_) {};
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getStats() : async {
    totalContacts : Nat;
    newLeads : Nat;
    contacted : Nat;
    qualified : Nat;
    proposal : Nat;
    closedWon : Nat;
    closedLost : Nat;
  } {
    var newLeads = 0;
    var contacted = 0;
    var qualified = 0;
    var proposal = 0;
    var closedWon = 0;
    var closedLost = 0;

    for ((_, contact) in contacts.entries()) {
      switch (contact) {
        case (#lead(data)) {
          switch (data.stage) {
            case (#New) { newLeads += 1 };
            case (#Contacted) { contacted += 1 };
            case (#Qualified) { qualified += 1 };
            case (#Proposal) { proposal += 1 };
            case (#ClosedWon) { closedWon += 1 };
            case (#ClosedLost) { closedLost += 1 };
          };
        };
        case (_) {};
      };
    };

    {
      totalContacts = contacts.size();
      newLeads;
      contacted;
      qualified;
      proposal;
      closedWon;
      closedLost;
    };
  };

  public shared ({ caller }) func updateContactStage(id : Nat, stage : Stage) : async Bool {
    switch (contacts.get(id)) {
      case (null) { false };
      case (?contact) {
        switch (contact) {
          case (#lead(data)) {
            let newContact : Contact = #lead({
              data with
              stage;
            });
            contacts.add(id, newContact);
            true;
          };
          case (_) { false };
        };
      };
    };
  };

  public shared ({ caller }) func convertLeadToActive(id : Nat) : async Bool {
    switch (contacts.get(id)) {
      case (null) { false };
      case (?contact) {
        switch (contact) {
          case (#lead(data)) {
            let newContact : Contact = #active({
              id = data.id;
              name = data.name;
              email = data.email;
              phone = data.phone;
              company = data.company;
              notes = data.notes;
            });
            contacts.add(id, newContact);
            true;
          };
          case (_) { false };
        };
      };
    };
  };

  public shared ({ caller }) func setContactInactive(id : Nat) : async Bool {
    switch (contacts.get(id)) {
      case (null) { false };
      case (?contact) {
        switch (contact) {
          case (#lead(data)) {
            let newContact : Contact = #inactive({
              id = data.id;
              name = data.name;
              email = data.email;
              phone = data.phone;
              company = data.company;
              notes = data.notes;
            });
            contacts.add(id, newContact);
            true;
          };
          case (#active(data)) {
            let newContact : Contact = #inactive(data);
            contacts.add(id, newContact);
            true;
          };
          case (#inactive(_)) { false };
        };
      };
    };
  };

  public query ({ caller }) func getActiveContacts() : async [Contact] {
    let results = List.empty<Contact>();
    for ((_, contact) in contacts.entries()) {
      switch (contact) {
        case (#active(_)) {
          results.add(contact);
        };
        case (_) {};
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getInactiveContacts() : async [Contact] {
    let results = List.empty<Contact>();
    for ((_, contact) in contacts.entries()) {
      switch (contact) {
        case (#inactive(_)) {
          results.add(contact);
        };
        case (_) {};
      };
    };
    results.toArray();
  };

  public shared ({ caller }) func convertStage(id : Nat, newStage : Stage) : async Bool {
    switch (contacts.get(id)) {
      case (null) { false };
      case (?contact) {
        switch (contact) {
          case (#lead(data)) {
            let newContact : Contact = #lead({
              data with
              stage = newStage;
            });
            contacts.add(id, newContact);
            true;
          };
          case (_) { false };
        };
      };
    };
  };

  public query ({ caller }) func countContactsByStage(stage : Stage) : async Nat {
    var count = 0;
    for ((_, contact) in contacts.entries()) {
      switch (contact) {
        case (#lead(data)) {
          if (data.stage == stage) {
            count += 1;
          };
        };
        case (_) {};
      };
    };
    count;
  };

  public query ({ caller }) func getContactCount() : async Nat {
    contacts.size();
  };

  public query ({ caller }) func getNextId() : async Nat {
    nextId;
  };
};
