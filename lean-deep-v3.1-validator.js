// lean-deep-v3.1-validator.js - Erweiterte Schema-Validierung

class LeanDeepV31Validator {
  constructor() {
    this.requiredFields = ['id', 'lang', 'description', 'frame', 'examples', 'activation_logic', 'scoring'];
    this.frameFields = ['signal', 'concept', 'pragmatics', 'narrative'];
    this.narrativeTypes = ['linear', 'loop', 'spike', 'drift', 'accumulative'];
    this.structureTypes = ['pattern', 'composed_of', 'detect_class'];
    this.prefixMap = {
      'A_': 'atomic',
      'S_': 'semantic', 
      'C_': 'cluster',
      'MM_': 'meta'
    };
  }

  validateMarker(content, filename) {
    const issues = [];
    const data = this.parseYAML(content);
    
    // 1. ID-Filename-Sync
    const expectedId = filename.replace('.yaml', '').replace('.yml', '');
    if (!data.id || data.id !== expectedId) {
      issues.push({
        type: 'id-sync',
        severity: 'high',
        message: `ID "${data.id}" muss exakt Dateiname "${expectedId}" sein`,
        fix: 'auto'
      });
    }
    
    // 2. Präfix-Validierung
    const prefix = data.id?.split('_')[0] + '_';
    if (!this.prefixMap[prefix]) {
      issues.push({
        type: 'prefix',
        severity: 'high', 
        message: `Ungültiger Präfix "${prefix}". Erlaubt: A_, S_, C_, MM_`,
        fix: 'manual'
      });
    }
    
    // 3. Frame-Vollständigkeit
    if (!data.frame) {
      issues.push({
        type: 'frame-missing',
        severity: 'high',
        message: 'Frame-Block fehlt komplett',
        fix: 'template'
      });
    } else {
      this.frameFields.forEach(field => {
        if (!data.frame[field]) {
          issues.push({
            type: 'frame-incomplete',
            severity: 'medium',
            message: `Frame.${field} fehlt`,
            fix: 'template'
          });
        }
      });
    }
    
    // 4. Narrative-Enum
    if (data.frame?.narrative && !this.narrativeTypes.includes(data.frame.narrative)) {
      issues.push({
        type: 'narrative-invalid',
        severity: 'medium',
        message: `Narrative "${data.frame.narrative}" ungültig. Erlaubt: ${this.narrativeTypes.join(', ')}`,
        fix: 'auto'
      });
    }
    
    // 5. Struktur-Block-Exklusivität
    const structureBlocksPresent = this.structureTypes.filter(type => data[type]);
    if (structureBlocksPresent.length === 0) {
      issues.push({
        type: 'structure-missing',
        severity: 'high',
        message: 'Struktur-Block fehlt (pattern|composed_of|detect_class)',
        fix: 'template'
      });
    } else if (structureBlocksPresent.length > 1) {
      issues.push({
        type: 'structure-multiple',
        severity: 'high', 
        message: `Nur ein Struktur-Block erlaubt, gefunden: ${structureBlocksPresent.join(', ')}`,
        fix: 'manual'
      });
    }
    
    // 6. TODO_EXAMPLE Detection
    if (JSON.stringify(data.examples).includes('TODO_EXAMPLE')) {
      issues.push({
        type: 'todo-example',
        severity: 'low',
        message: 'TODO_EXAMPLE Platzhalter gefunden',
        fix: 'manual'
      });
    }
    
    // 7. Legacy v3.0 Detection
    const legacyFields = ['level', 'category', 'marker-alias'];
    const foundLegacy = legacyFields.filter(field => data[field]);
    if (foundLegacy.length > 0) {
      issues.push({
        type: 'legacy-migration',
        severity: 'medium',
        message: `Legacy v3.0 Felder gefunden: ${foundLegacy.join(', ')}`,
        fix: 'migration'
      });
    }
    
    return {
      filename,
      version: this.detectVersion(data),
      issues,
      isV31Compliant: issues.filter(i => i.severity === 'high').length === 0,
      needsMigration: foundLegacy.length > 0
    };
  }
  
  detectVersion(data) {
    if (data.level || data.category || data['marker-alias']) {
      return 'v3.0';
    }
    if (data.frame && data.id) {
      return 'v3.1';
    }
    return 'unknown';
  }
  
  parseYAML(content) {
    // Simplified YAML parsing for validation
    try {
      // Basic YAML parsing logic here
      return JSON.parse(content); // Placeholder
    } catch (error) {
      return {};
    }
  }
}

module.exports = LeanDeepV31Validator;
