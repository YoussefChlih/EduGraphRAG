"""Knowledge graph data endpoint."""

from fastapi import APIRouter, HTTPException

from app.services.neo4j_service import run_query

router = APIRouter()


@router.get("/graph")
async def get_graph():
    """Get graph data for visualization."""
    try:
        # Fetch concepts
        concept_results = await run_query(
            """MATCH (c:Concept)
               RETURN c.name AS name, c.description AS description
               LIMIT 200"""
        )

        # Fetch relationships
        rel_results = await run_query(
            """MATCH (s:Concept)-[r]->(t:Concept)
               RETURN s.name AS source, t.name AS target, type(r) AS type
               LIMIT 500"""
        )

        nodes = [
            {
                "id": r["name"],
                "label": r["name"],
                "type": "concept",
                "description": r["description"],
            }
            for r in concept_results
        ]

        edges = [
            {
                "source": r["source"],
                "target": r["target"],
                "type": r["type"],
                "label": r["type"].replace("_", " ").lower(),
            }
            for r in rel_results
        ]

        return {"success": True, "data": {"nodes": nodes, "edges": edges}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch graph: {str(e)}")
