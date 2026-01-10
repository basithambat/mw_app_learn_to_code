/// Enum constants matching backend Prisma schema
/// 
/// IMPORTANT: These values MUST match the enums defined in:
/// apps/api/prisma/schema.prisma
/// 
/// Last synced: 2026-01-10

/// Relationship types for people in a will
class RelationshipType {
  static const String SELF = 'SELF';
  static const String SPOUSE = 'SPOUSE';
  static const String SON = 'SON';
  static const String DAUGHTER = 'DAUGHTER';
  static const String MOTHER = 'MOTHER';
  static const String FATHER = 'FATHER';
  static const String BROTHER = 'BROTHER';
  static const String SISTER = 'SISTER';
  static const String OTHER = 'OTHER';

  /// Helper: Check if relationship is a child (SON or DAUGHTER)
  static bool isChild(String? relationship) {
    return relationship == SON || relationship == DAUGHTER;
  }

  /// Helper: Check if relationship is a parent (MOTHER or FATHER)
  static bool isParent(String? relationship) {
    return relationship == MOTHER || relationship == FATHER;
  }

  /// Helper: Check if relationship is a sibling (BROTHER or SISTER)
  static bool isSibling(String? relationship) {
    return relationship == BROTHER || relationship == SISTER;
  }

  /// All valid relationship types
  static const List<String> values = [
    SELF,
    SPOUSE,
    SON,
    DAUGHTER,
    MOTHER,
    FATHER,
    BROTHER,
    SISTER,
    OTHER,
  ];
}

/// Gender types
class Gender {
  static const String MALE = 'MALE';
  static const String FEMALE = 'FEMALE';
  static const String OTHER = 'OTHER';
  static const String PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY';

  static const List<String> values = [
    MALE,
    FEMALE,
    OTHER,
    PREFER_NOT_TO_SAY,
  ];
}

/// Asset categories
class AssetCategory {
  static const String REAL_ESTATE = 'REAL_ESTATE';
  static const String VEHICLE = 'VEHICLE';
  static const String GADGET = 'GADGET';
  static const String JEWELLERY = 'JEWELLERY';
  static const String BUSINESS = 'BUSINESS';
  static const String INVESTMENT = 'INVESTMENT';
  static const String LIABILITY = 'LIABILITY';
  static const String BANK_ACCOUNT = 'BANK_ACCOUNT';
  static const String INSURANCE = 'INSURANCE';
  static const String DIGITAL = 'DIGITAL';
  static const String OTHER = 'OTHER';

  static const List<String> values = [
    REAL_ESTATE,
    VEHICLE,
    GADGET,
    JEWELLERY,
    BUSINESS,
    INVESTMENT,
    LIABILITY,
    BANK_ACCOUNT,
    INSURANCE,
    DIGITAL,
    OTHER,
  ];
}

/// Ownership types for assets
class OwnershipType {
  static const String SELF_ACQUIRED = 'SELF_ACQUIRED';
  static const String JOINT = 'JOINT';
  static const String INHERITED = 'INHERITED';
  static const String ANCESTRAL = 'ANCESTRAL';
  static const String HUF = 'HUF';
  static const String GIFTED = 'GIFTED';

  static const List<String> values = [
    SELF_ACQUIRED,
    JOINT,
    INHERITED,
    ANCESTRAL,
    HUF,
    GIFTED,
  ];
}

/// Inheritance scenario types
class ScenarioType {
  static const String USER_DIES_FIRST = 'USER_DIES_FIRST';
  static const String SPOUSE_DIES_FIRST = 'SPOUSE_DIES_FIRST';
  static const String NO_ONE_SURVIVES = 'NO_ONE_SURVIVES';

  static const List<String> values = [
    USER_DIES_FIRST,
    SPOUSE_DIES_FIRST,
    NO_ONE_SURVIVES,
  ];
}

/// Personal law systems (Note: This is a String field, not an enum in schema)
class PersonalLaw {
  static const String MUSLIM = 'MUSLIM';
  static const String HINDU = 'HINDU';
  static const String CHRISTIAN = 'CHRISTIAN';
  static const String UNKNOWN = 'UNKNOWN';

  static const List<String> values = [
    MUSLIM,
    HINDU,
    CHRISTIAN,
    UNKNOWN,
  ];
}

/// Witness status types
class WitnessStatus {
  static const String PENDING = 'PENDING';
  static const String INVITED = 'INVITED';
  static const String CONFIRMED = 'CONFIRMED';

  static const List<String> values = [
    PENDING,
    INVITED,
    CONFIRMED,
  ];
}

/// Signature types
class SignatureType {
  static const String DRAWN = 'DRAWN';
  static const String UPLOADED = 'UPLOADED';

  static const List<String> values = [
    DRAWN,
    UPLOADED,
  ];
}

/// Consent video status
class ConsentVideoStatus {
  static const String NOT_RECORDED = 'NOT_RECORDED';
  static const String RECORDED = 'RECORDED';
  static const String VERIFIED = 'VERIFIED';

  static const List<String> values = [
    NOT_RECORDED,
    RECORDED,
    VERIFIED,
  ];
}

/// Consent status
class ConsentStatus {
  static const String PENDING = 'PENDING';
  static const String GIVEN = 'GIVEN';
  static const String REFUSED = 'REFUSED';

  static const List<String> values = [
    PENDING,
    GIVEN,
    REFUSED,
  ];
}
