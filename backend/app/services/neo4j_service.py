from neo4j import GraphDatabase, Driver
from app.config import settings

_driver: Driver | None = None


def get_driver() -> Driver:
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_username, settings.neo4j_password),
        )
    return _driver


async def run_query(cypher: str, params: dict | None = None) -> list[dict]:
    """Execute a Cypher query and return results as list of dicts."""
    driver = get_driver()
    with driver.session() as session:
        result = session.run(cypher, params or {})
        return [record.data() for record in result]


async def close_driver():
    global _driver
    if _driver:
        _driver.close()
        _driver = None
