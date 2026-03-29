import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
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

  type Actor = {
    contacts : Map.Map<Nat, Contact>;
    nextId : Nat;
  };

  public func run(_old : {}) : Actor {
    {
      contacts = Map.empty<Nat, Contact>();
      nextId = 1;
    };
  };
};
