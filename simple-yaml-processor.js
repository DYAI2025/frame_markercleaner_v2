// simple-yaml-processor.js - Einfacher YAML-Prozessor für echte Tests

const fs = require('fs');
const path = require('path');

class SimpleYAMLProcessor {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.results = {
      total: 0,
      clean: 0,
      fixId: 0,
      fixExample: 0,
      fixStructure: 0,
      review: 0,
      files: []
    };
  }

  async processFolder() {
    console.log('🔍 Processing folder:', this.folderPath);
    
    try {
      const files = fs.readdirSync(this.folderPath);
      const yamlFiles = files.filter(file => 
        file.endsWith('.yaml') || file.endsWith('.yml')
      );
      
      console.log(`📁 Found ${yamlFiles.length} YAML files`);
      
      for (const filename of yamlFiles) {
        const filePath = path.join(this.folderPath, filename);
        await this.processFile(filePath, filename);
      }
      
      console.log('✅ Processing complete:', this.results);
      return this.results;
      
    } catch (error) {
      console.error('❌ Error processing folder:', error);
      throw error;
    }
  }

  async processFile(filePath, filename) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = this.analyzeYAML(content, filename);
      
      this.results.total++;
      this.results.files.push({
        filename,
        path: filePath,
        ...analysis
      });
      
      // Kategorisierung
      if (analysis.issues.length === 0) {
        this.results.clean++;
      } else {
        if (analysis.issues.some(i => i.type === 'id')) {
          this.results.fixId++;
        } else if (analysis.issues.some(i => i.type === 'example')) {
          this.results.fixExample++;  
        } else if (analysis.issues.some(i => i.type === 'structure')) {
          this.results.fixStructure++;
        } else {
          this.results.review++;
        }
      }
      
      console.log(`📄 ${filename}: ${analysis.issues.length} issues found`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error);
      this.results.review++; // Fehlerhafte Dateien zur Review
      this.results.total++;
    }
  }

  analyzeYAML(content, filename) {
    const issues = [];
    const lines = content.split('\n');
    
    // Check 1: ID missing or malformed
    if (!content.includes('id:') || content.match(/^#\s*id:/m)) {
      issues.push({
        type: 'id',
        severity: 'high',
        message: 'ID is missing or commented out',
        line: this.findLineNumber(lines, /id:|# id:/)
      });
    }
    
    // Check 2: YAML syntax errors
    if (content.includes('examples\n  -') && !content.includes('examples:')) {
      issues.push({
        type: 'structure', 
        severity: 'high',
        message: 'Missing colon after "examples"',
        line: this.findLineNumber(lines, /^examples\s*$/)
      });
    }
    
    // Check 3: Example formatting
    if (content.includes('examples:') && !content.match(/examples:\s*\n\s*-/)) {
      issues.push({
        type: 'example',
        severity: 'medium', 
        message: 'Examples formatting could be improved',
        line: this.findLineNumber(lines, /examples:/)
      });
    }
    
    // Check 4: Name issues
    if (!content.includes('name:')) {
      issues.push({
        type: 'id',
        severity: 'high',
        message: 'Name field is missing',
        line: 1
      });
    }
    
    return {
      filename,
      issues,
      status: issues.length === 0 ? 'clean' : 'needs_fix',
      lineCount: lines.length
    };
  }
  
  findLineNumber(lines, regex) {
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        return i + 1;
      }
    }
    return 1;
  }
}

module.exports = SimpleYAMLProcessor;
