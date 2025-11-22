export type VideoStatus = "pending" | "approved_canon" | "approved_fan" | "rejected";

export type AnimationType = "canon" | "fan";

export interface AuthorLink {
    platform: string; // e.g., "Twitter", "YouTube", or custom "BlueSky"
    url: string;
}

export interface VideoData {
    id?: string;                  // Firestore Document ID (optional because it's added after fetch)
    creatorName: string;          // The Animator's name (e.g. "TGSmurf")
    videoLink: string;            // URL to the video
    chapterStart: number;         // Start Chapter
    chapterEnd: number;           // End Chapter
    description: string;          // Description or Creator's notes
    animationType: AnimationType; // Classification
    authorLinks: AuthorLink[];    // List of social links
    timestamp: number;            // Date.now() format
    status: VideoStatus;          // Approval status
    likes: number;                // Support count
}