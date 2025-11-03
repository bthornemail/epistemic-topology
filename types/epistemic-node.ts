/**
 * Unified Tag-Based Epistemic Node Interface
 * 
 * This interface defines the epistemic topology structure for organizing
 * knowledge in a way that is accessible to people of all backgrounds.
 * 
 * The four-level structure (gateway → foundational → practical → applied)
 * creates multiple entry points and learning paths through the material.
 */

export interface EpistemicNode {
  // ============================================================================
  // CORE IDENTITY
  // ============================================================================
  
  /**
   * Unique identifier for this node in the epistemic graph.
   * Format: kebab-case string, e.g., "observable-parameterization"
   */
  id: string;
  
  /**
   * Human-readable title displayed to users
   */
  title: string;
  
  /**
   * Epistemic level determines the target audience and depth:
   * - gateway: Entry points for newcomers (analogies, motivation, why it matters)
   * - foundational: Core concepts with minimal prerequisites
   * - practical: Implementation details and how-to guides
   * - applied: Real-world applications and case studies
   */
  level: 'gateway' | 'foundational' | 'practical' | 'applied';
  
  /**
   * Content type determines the document's purpose:
   * - navigation: Index/hub connecting to other nodes
   * - concept: Explains a theoretical idea or principle
   * - implementation: Code, algorithms, technical details
   * - application: Use cases, examples, case studies
   * - guide: Step-by-step instructions or tutorials
   */
  type: 'navigation' | 'concept' | 'implementation' | 'application' | 'guide';
  
  // ============================================================================
  // SEMANTIC LOCATION VIA TAGS
  // ============================================================================
  
  /**
   * Primary categorization tags for content discovery.
   * Examples: ["distributed-systems", "lattice-theory", "consensus"]
   */
  tags: string[];
  
  /**
   * Secondary indexing keywords for search.
   * Examples: ["vector-clocks", "causality", "byzantine-fault-tolerance"]
   */
  keywords: string[];
  
  // ============================================================================
  // CONTENT RELATIONSHIPS
  // ============================================================================
  
  /**
   * Node IDs that should be understood before this one.
   * Empty array means this is a gateway node with no prerequisites.
   */
  prerequisites: string[];
  
  /**
   * Node IDs that this knowledge enables understanding of.
   * Helps users see where their learning path leads.
   */
  enables: string[];
  
  /**
   * Related node IDs at similar depth but different topics.
   * Supports lateral exploration of the knowledge graph.
   */
  related: string[];
  
  // ============================================================================
  // IMPLEMENTATION & CONTENT
  // ============================================================================
  
  /**
   * Paths to code files, examples, or implementations.
   * Optional - only present for implementation nodes.
   */
  implementations?: string[];
  
  /**
   * List of theoretical concepts covered in this node.
   * Optional - helps with concept indexing.
   */
  concepts?: string[];
  
  /**
   * Application domains where this knowledge is relevant.
   * Examples: ["blockchain", "iot", "cloud-computing"]
   */
  domains?: string[];
  
  /**
   * Reading time estimate in minutes
   */
  readingTime?: number;
  
  /**
   * Difficulty rating (1-5 scale)
   * 1 = accessible to anyone
   * 5 = requires deep background knowledge
   */
  difficulty?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Epistemic Graph represents the complete knowledge structure
 */
export interface EpistemicGraph {
  /**
   * All nodes in the epistemic topology
   */
  nodes: Map<string, EpistemicNode>;
  
  /**
   * Entry points organized by audience/interest
   */
  entryPoints: {
    /** For developers wanting to use DANL */
    practitioner: string[];
    /** For researchers studying the theory */
    researcher: string[];
    /** For curious learners exploring ideas */
    learner: string[];
    /** For decision-makers evaluating the technology */
    executive: string[];
  };
  
  /**
   * Curated learning paths through the material
   */
  paths: LearningPath[];
}

/**
 * Learning Path represents a curated journey through the material
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  audience: string[];
  estimatedTime: number; // minutes
  nodes: string[]; // ordered list of node IDs
}

/**
 * Validation result for epistemic node structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Metadata for document front matter (YAML)
 */
export interface EpistemicFrontMatter extends EpistemicNode {
  /** ISO 8601 date string */
  dateCreated?: string;
  /** ISO 8601 date string */
  dateModified?: string;
  /** Author(s) */
  authors?: string[];
  /** Version number */
  version?: string;
  /** Status: draft, review, published */
  status?: 'draft' | 'review' | 'published';
}
