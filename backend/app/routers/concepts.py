"""Concepts listing endpoint."""

from fastapi import APIRouter, HTTPException

from app.services.neo4j_service import run_query

router = APIRouter()


@router.get("/concepts")
async def list_concepts():
    """List extracted concepts with their relationships."""
    try:
        results = await run_query(
            """MATCH (c:Concept)
               OPTIONAL MATCH (c)<-[:MENTIONS]-(chunk:Chunk)<-[:HAS_CHUNK]-(d:Document)
               WITH c, count(DISTINCT d) AS doc_count
               OPTIONAL MATCH (c)-[:RELATED_TO|PREREQUISITE_OF|PART_OF]-(related:Concept)
               RETURN c.name AS name, c.description AS description,
                      doc_count AS document_count,
                      collect(DISTINCT related.name)[..5] AS related_concepts
               ORDER BY doc_count DESC
               LIMIT 100"""
        )

        return {"success": True, "data": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch concepts: {str(e)}")
