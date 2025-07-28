#!/usr/bin/env python3
"""
marker_cleaner_integration.py - Python Core for Frame Markercleaner

Provides real YAML marker cleaning and analysis functionality.
Replaces the JavaScript mock processor with robust Python implementation.
"""

import os
import sys
import json
import argparse
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional
import re


class MarkerCleanerCore:
    """Core marker cleaning and analysis engine."""
    
    def __init__(self, folder_path: str):
        self.folder_path = Path(folder_path)
        self.results = {
            'total': 0,
            'clean': 0,
            'fixId': 0,
            'fixExample': 0,
            'fixStructure': 0,
            'review': 0,
            'files': []
        }
        
    def process_folder(self) -> Dict[str, Any]:
        """Process all YAML files in the folder and return analysis results."""
        if not self.folder_path.exists():
            raise FileNotFoundError(f"Folder not found: {self.folder_path}")
            
        yaml_files = list(self.folder_path.glob("*.yaml")) + list(self.folder_path.glob("*.yml"))
        
        self.log_progress(f"Found {len(yaml_files)} YAML files", 10)
        
        for i, yaml_file in enumerate(yaml_files):
            self.process_file(yaml_file)
            # Report progress
            progress = 10 + int((i + 1) / len(yaml_files) * 80)
            self.log_progress(f"Processed {yaml_file.name}", progress)
            
        self.log_progress("Analysis complete", 100)
        return self.results
        
    def process_file(self, file_path: Path) -> None:
        """Process a single YAML file and categorize issues."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            analysis = self.analyze_yaml(content, file_path.name)
            
            self.results['total'] += 1
            self.results['files'].append({
                'filename': file_path.name,
                'path': str(file_path),
                **analysis
            })
            
            # Categorize based on primary issue type
            if len(analysis['issues']) == 0:
                self.results['clean'] += 1
            else:
                primary_category = self.categorize_issues(analysis['issues'])
                self.results[primary_category] += 1
                
        except Exception as e:
            # Files with critical errors go to review
            self.results['total'] += 1
            self.results['review'] += 1
            self.results['files'].append({
                'filename': file_path.name,
                'path': str(file_path),
                'issues': [{
                    'type': 'critical',
                    'severity': 'critical',
                    'message': f"Failed to process file: {str(e)}",
                    'line': 1
                }],
                'status': 'error',
                'lineCount': 0
            })
            
    def analyze_yaml(self, content: str, filename: str) -> Dict[str, Any]:
        """Analyze YAML content and identify issues."""
        issues = []
        lines = content.split('\n')
        
        # Issue 1: ID field validation
        id_issues = self._check_id_field(content, lines)
        issues.extend(id_issues)
        
        # Issue 2: YAML structure validation
        structure_issues = self._check_yaml_structure(content, lines)
        issues.extend(structure_issues)
        
        # Issue 3: Examples formatting
        example_issues = self._check_examples(content, lines)
        issues.extend(example_issues)
        
        # Issue 4: Required fields
        field_issues = self._check_required_fields(content, lines)
        issues.extend(field_issues)
        
        # Issue 5: YAML syntax validation
        syntax_issues = self._check_yaml_syntax(content)
        issues.extend(syntax_issues)
        
        return {
            'filename': filename,
            'issues': issues,
            'status': 'clean' if len(issues) == 0 else 'needs_fix',
            'lineCount': len(lines)
        }
        
    def _check_id_field(self, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for ID field issues."""
        issues = []
        
        # Check if ID is missing
        if not re.search(r'^id\s*:', content, re.MULTILINE):
            issues.append({
                'type': 'id',
                'severity': 'high',
                'message': 'ID field is missing',
                'line': self._find_line_for_insertion(lines, 'id')
            })
        
        # Check if ID is commented out
        elif re.search(r'^\s*#\s*id\s*:', content, re.MULTILINE):
            line_num = self._find_line_number(lines, r'^\s*#\s*id\s*:')
            issues.append({
                'type': 'id',
                'severity': 'high',
                'message': 'ID field is commented out',
                'line': line_num
            })
            
        # Check ID format
        id_match = re.search(r'^id\s*:\s*(.+)', content, re.MULTILINE)
        if id_match:
            id_value = id_match.group(1).strip().strip('"\'')
            if not re.match(r'^[A-Z][A-Z0-9_]*$', id_value):
                line_num = self._find_line_number(lines, r'^id\s*:')
                issues.append({
                    'type': 'id',
                    'severity': 'medium',
                    'message': f'ID format should be uppercase with underscores: {id_value}',
                    'line': line_num
                })
                
        return issues
        
    def _check_yaml_structure(self, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for YAML structure issues."""
        issues = []
        
        # Check for missing colons after keys
        for i, line in enumerate(lines):
            # Look for keys without colons (but not comments or list items)
            if re.match(r'^[a-zA-Z][a-zA-Z0-9_]*\s*$', line.strip()):
                if i + 1 < len(lines) and re.match(r'^\s*-', lines[i + 1].strip()):
                    issues.append({
                        'type': 'structure',
                        'severity': 'high',
                        'message': f'Missing colon after key "{line.strip()}"',
                        'line': i + 1
                    })
                    
        return issues
        
    def _check_examples(self, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check examples section formatting."""
        issues = []
        
        if 'examples:' in content:
            # Check if examples section has proper list formatting
            examples_line = self._find_line_number(lines, r'examples\s*:')
            if examples_line > 0 and examples_line < len(lines):
                # Look at next few lines to see if they're properly formatted
                has_list_items = False
                for i in range(examples_line, min(examples_line + 5, len(lines))):
                    if re.match(r'^\s*-\s+', lines[i]):
                        has_list_items = True
                        break
                        
                if not has_list_items:
                    issues.append({
                        'type': 'example',
                        'severity': 'medium',
                        'message': 'Examples section should contain list items starting with "-"',
                        'line': examples_line
                    })
                    
        return issues
        
    def _check_required_fields(self, content: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for required fields."""
        issues = []
        required_fields = ['name', 'description']
        
        for field in required_fields:
            if not re.search(f'^{field}\\s*:', content, re.MULTILINE):
                issues.append({
                    'type': 'id' if field == 'name' else 'structure',
                    'severity': 'high',
                    'message': f'Required field "{field}" is missing',
                    'line': self._find_line_for_insertion(lines, field)
                })
                
        return issues
        
    def _check_yaml_syntax(self, content: str) -> List[Dict[str, Any]]:
        """Check for YAML syntax errors."""
        issues = []
        
        try:
            yaml.safe_load(content)
        except yaml.YAMLError as e:
            line_num = 1
            if hasattr(e, 'problem_mark') and e.problem_mark:
                line_num = e.problem_mark.line + 1
            issues.append({
                'type': 'structure',
                'severity': 'critical',
                'message': f'YAML syntax error: {str(e)}',
                'line': line_num
            })
            
        return issues
        
    def categorize_issues(self, issues: List[Dict[str, Any]]) -> str:
        """Categorize issues to determine primary fix type."""
        if not issues:
            return 'clean'
            
        # Priority order for categorization
        issue_types = [issue['type'] for issue in issues]
        severities = [issue['severity'] for issue in issues]
        
        # Critical syntax errors that make file unparseable go to review
        if 'critical' in severities and any(issue['type'] == 'critical' for issue in issues):
            return 'review'
            
        # ID issues have high priority
        if 'id' in issue_types:
            return 'fixId'
            
        # Structure issues (including critical structure issues)
        if 'structure' in issue_types:
            return 'fixStructure'
            
        # Example formatting issues
        if 'example' in issue_types:
            return 'fixExample'
            
        # Default to review for unknown issues
        return 'review'
        
    def _find_line_number(self, lines: List[str], pattern: str) -> int:
        """Find line number matching regex pattern."""
        regex = re.compile(pattern)
        for i, line in enumerate(lines):
            if regex.search(line):
                return i + 1
        return 1
        
    def _find_line_for_insertion(self, lines: List[str], field: str) -> int:
        """Find appropriate line number for inserting a missing field."""
        # Try to find a good place to insert after similar fields
        if field == 'id':
            name_line = self._find_line_number(lines, r'^name\s*:')
            return name_line + 1 if name_line > 1 else 2
        elif field == 'name':
            return 2  # After comment/header
        else:
            return len(lines) + 1
            
    def log_progress(self, message: str, percent: int) -> None:
        """Log progress information (can be captured by parent process)."""
        progress_data = {
            'type': 'progress',
            'message': message,
            'percent': percent
        }
        print(f"PROGRESS:{json.dumps(progress_data)}", file=sys.stderr)
        

def main():
    """Main entry point for command line usage."""
    parser = argparse.ArgumentParser(description='Process YAML marker files')
    parser.add_argument('folder_path', help='Path to folder containing YAML marker files')
    parser.add_argument('--output', '-o', help='Output file for results (default: stdout)')
    
    args = parser.parse_args()
    
    try:
        processor = MarkerCleanerCore(args.folder_path)
        results = processor.process_folder()
        
        output_data = {
            'success': True,
            'results': results,
            'folder_path': args.folder_path
        }
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(output_data, f, indent=2)
        else:
            print(json.dumps(output_data, indent=2))
            
    except Exception as e:
        error_data = {
            'success': False,
            'error': str(e),
            'folder_path': args.folder_path
        }
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(error_data, f, indent=2)
        else:
            print(json.dumps(error_data, indent=2))
        
        sys.exit(1)


if __name__ == '__main__':
    main()