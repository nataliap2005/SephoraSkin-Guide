import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
import os
import glob

# ===============================================
# 🔍 Función para detectar el CSV real de Spark
# ===============================================
def encontrar_csv_spark(directorio_base):
    archivos = glob.glob(os.path.join(directorio_base, "_temporary", "**", "part-*.csv"), recursive=True)
    if archivos:
        print(f"[✅] CSV encontrado: {archivos[0]}")
        return archivos[0]
    else:
        print(f"[❌] No se encontró CSV en {directorio_base}")
        return None

# ===============================================
# 📂 Rutas de los 10 CSVs exportados por Spark
# ===============================================
ranking_path       = encontrar_csv_spark('/root/results/ranking_popularidad')
relacion_path      = encontrar_csv_spark('/root/results/relacion_precio_popularidad')
segmentos_path     = encontrar_csv_spark('/root/results/price_segment_analysis')
stock_path         = encontrar_csv_spark('/root/results/stock_analysis')
nuevos_path        = encontrar_csv_spark('/root/results/new_products')
online_path        = encontrar_csv_spark('/root/results/online_only_analysis')
categoria_path     = encontrar_csv_spark('/root/results/category_distribution')
marcas_path        = encontrar_csv_spark('/root/results/top_brands')
exclusivos_path    = encontrar_csv_spark('/root/results/sephora_exclusives')

# ===============================================
# 📄 Leer los CSVs con manejo de errores
# ===============================================
def cargar_csv(path):
    try:
        return pd.read_csv(path) if path else pd.DataFrame()
    except Exception as e:
        print(f"[❌] Error leyendo {path}: {e}")
        return pd.DataFrame()

ranking     = cargar_csv(ranking_path)
relacion    = cargar_csv(relacion_path)
segmentos   = cargar_csv(segmentos_path)
stock       = cargar_csv(stock_path)
nuevos      = cargar_csv(nuevos_path)
online      = cargar_csv(online_path)
categorias  = cargar_csv(categoria_path)
marcas      = cargar_csv(marcas_path)
exclusivos  = cargar_csv(exclusivos_path)

# ===============================================
# 🎨 Estilo y diseño base
# ===============================================
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])

navbar = dbc.Navbar(
    dbc.Container([
        dbc.NavbarBrand("Métricas Sephora", className="ms-2"),
        dbc.DropdownMenu(
            children=[
                dbc.DropdownMenuItem("Inicio", href="http://192.168.100.3:8081/Pagina_productos/admin.php"),
                dbc.DropdownMenuItem(divider=True),
                dbc.DropdownMenuItem("Cerrar sesión", href="http://192.168.100.3:8081/Login/login.php")
            ],
            nav=True,
            in_navbar=True,
            label="Usuario Admin",
            align_end=True
        )
    ]),
    color="#6f42c1",
    dark=True,
    className="mb-4"
)

welcome_section = dbc.Card(
    dbc.CardBody([
        html.H2("Bienvenido, Administrador", className="card-title"),
        html.P("Panel de análisis de productos Sephora", className="card-text")
    ]),
    className="mb-4 shadow"
)

# ===============================================
# 📊 GRÁFICAS - 10 Consultas Visualizadas
# ===============================================
def chart_popularidad():
    if ranking.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    top10 = ranking.sort_values("loves_count", ascending=False).head(10)
    fig = px.bar(top10, x="loves_count", y="product_name", orientation='h', color="loves_count",
                 title="Top 10 productos más populares", labels={"product_name": "Producto", "loves_count": "Likes"})
    fig.update_layout(yaxis={'categoryorder': 'total ascending'}, plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_relacion_precio_popularidad():
    if relacion.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    df = relacion.dropna(subset=["avg_reviews", "price_usd", "avg_rating"])
    fig = px.scatter(df, x="price_usd", y="avg_rating", size="avg_reviews", color="avg_reviews",
                     title="Relación entre Precio y Popularidad",
                     labels={"price_usd": "Precio", "avg_rating": "Rating", "avg_reviews": "Reviews"})
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_segmentos_precio():
    if segmentos.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    fig = px.bar(segmentos, x="price_segment", y="count_products", color="price_segment",
                 title="Distribución por Segmento de Precio",
                 labels={"count_products": "Productos", "price_segment": "Segmento"})
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_stock():
    if stock.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    labels = stock["out_of_stock"].map({0: "En stock", 1: "Agotado"}).astype(str)
    fig = px.pie(stock, names=labels, values="count_products", title="Estado del Inventario",
                 color=labels, color_discrete_map={"En stock": "#6f42c1", "Agotado": "#d6bcfa"})
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_correlacion():
    if relacion.empty or not all(col in relacion.columns for col in ["price_usd", "avg_rating"]):
        return dbc.Alert("No se pudo calcular la matriz de correlación", color="warning")

    df_corr = relacion[["price_usd", "avg_rating"]].dropna()
    corr_matrix = df_corr.corr()

    fig = px.imshow(
        corr_matrix,
        text_auto=".2f",
        color_continuous_scale="Purples",
        labels=dict(x="Variables", y="Variables", color="Correlación"),
        title="📌 Matriz de Correlación: Precio vs Rating"
    )
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_nuevos():
    if nuevos.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    labels = nuevos["new"].map({0: "No nuevo", 1: "Nuevo"}).astype(str)
    fig = px.pie(nuevos, names=labels, values="count_products", title="Productos Nuevos vs No Nuevos",
                 color=labels, color_discrete_map={"Nuevo": "#6f42c1", "No nuevo": "#d6bcfa"})
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_online_only():
    if online.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    labels = online["online_only"].map({0: "En tienda y online", 1: "Solo online"}).astype(str)
    fig = px.pie(online, names=labels, values="count_products", title="Disponibilidad Exclusiva Online",
                 color=labels, color_discrete_map={"Solo online": "#6f42c1", "En tienda y online": "#d6bcfa"})
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_categoria():
    if categorias.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    top = categorias.sort_values("count_products", ascending=False).head(10)
    fig = px.bar(top, x="primary_category", y="count_products", color="primary_category",
                 title="Top 10 Categorías Principales", labels={"primary_category": "Categoría", "count_products": "Productos"})
    fig.update_layout(xaxis_tickangle=45, plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_marcas():
    if marcas.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    top = marcas.sort_values("count_products", ascending=False).head(10)
    fig = px.bar(top, x="count_products", y="brand_name", orientation="h", color="count_products",
                 title="Top 10 Marcas con más Productos", labels={"brand_name": "Marca", "count_products": "Productos"})
    fig.update_layout(yaxis={'categoryorder': 'total ascending'}, plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

def chart_exclusivos():
    if exclusivos.empty:
        return dbc.Alert("Datos no disponibles", color="warning")
    labels = exclusivos["sephora_exclusive"].map({0: "No exclusivos", 1: "Exclusivos"}).astype(str)
    fig = px.pie(exclusivos, names=labels, values="count_products", title="Productos Exclusivos de Sephora",
                 color=labels, color_discrete_map={"Exclusivos": "#6f42c1", "No exclusivos": "#d6bcfa"})
    fig.update_layout(plot_bgcolor='white', paper_bgcolor='white')
    return dcc.Graph(figure=fig)

# ===============================================
# 🧱 Layout Final - Secciones Visuales
# ===============================================
app.layout = dbc.Container([
    navbar,
    welcome_section,
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("📊 Popularidad de Productos"), dbc.CardBody(chart_popularidad())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("📈 Relación Precio-Popularidad"), dbc.CardBody(chart_relacion_precio_popularidad())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("💸 Segmentos de Precio"), dbc.CardBody(chart_segmentos_precio())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("📦 Estado del Inventario"), dbc.CardBody(chart_stock())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("📌 Matriz de Correlación Precio-Rating"), dbc.CardBody(chart_correlacion())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("🆕 Productos Nuevos vs No Nuevos"), dbc.CardBody(chart_nuevos())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("🌐 Solo Online vs Mixtos"), dbc.CardBody(chart_online_only())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("🌟 Categorías con más Productos"), dbc.CardBody(chart_categoria())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("🏷️ Marcas más Populares"), dbc.CardBody(chart_marcas())], className="mb-4 shadow"))]),
    dbc.Row([dbc.Col(dbc.Card([dbc.CardHeader("🎯 Productos Exclusivos Sephora"), dbc.CardBody(chart_exclusivos())], className="mb-4 shadow"))]),
    dbc.Row(dbc.Col(html.P("© 2025 Sephora Analytics", className="text-center text-muted small")))
], fluid=True, style={"backgroundColor": "#f8f9fa", "minHeight": "100vh", "padding": "20px"})

# ===============================================
# 🚀 Ejecutar Servidor
# ===============================================
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8050)
