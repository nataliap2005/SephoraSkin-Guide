import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import pandas as pd

# Leer archivos CSV
ranking_path = 'results/ranking_popularidad/part-00000-73bf297d-d602-4f02-8d60-bf67205b3be4-c000.csv'
relacion_path = 'results/relacion_precio_popularidad/part-00000-32ac46d8-824b-405d-8bc9-5d4aad54a35c-c000.csv'
price_path = 'results/price_segment_analysis/part-00000-145e1e45-ea59-4d4d-933b-284357784593-c000.csv'
ranking_popularidad = pd.read_csv(ranking_path, on_bad_lines='skip', header=0)
relacion_precio_popularidad = pd.read_csv(relacion_path, on_bad_lines='skip', header=0)

# Obtener top 10 productos
top_productos = ranking_popularidad.sort_values('avg_loves', ascending=False).head(10)

app = dash.Dash(_name_, external_stylesheets=[dbc.themes.BOOTSTRAP])

# Barra de navegación superior simplificada
navbar = dbc.Navbar(
    dbc.Container(
        [
            dbc.NavbarBrand("Métricas Sephora", className="ms-2"),
            dbc.DropdownMenu(
                [
                    dbc.DropdownMenuItem("Inicio", href="http://192.168.100.2:8080/Pagina_productos/admin.php"),
                    dbc.DropdownMenuItem(divider=True),
                    dbc.DropdownMenuItem("Cerrar sesión", href="http://192.168.100.2:8080/Login/login.php"),
                ],
                nav=True,
                in_navbar=True,
                label="Usuario Admin",
                align_end=True,
            ),
        ],
        fluid=True,
    ),
    color="#6f42c1",
    dark=True,
    className="mb-4",
)

# Sección de bienvenida
welcome_section = dbc.Card(
    dbc.CardBody(
        [
            html.H2("Bienvenido, Administrador", className="card-title"),
            html.P("Panel de análisis de productos Sephora", className="card-text"),
        ]
    ),
    className="mb-4 shadow",
)

# Sección principal con gráficos y productos destacados
main_section = dbc.Row(
    [
        # Columna izquierda con gráficos
        dbc.Col(
            [
                # Gráfico de popularidad (como en la imagen original)
                dbc.Card(
                    [
                        dbc.CardHeader(html.H4("Ranking de Popularidad por Producto", className="mb-0")),
                        dbc.CardBody(
                            dcc.Graph(
                                id='grafico-popularidad',
                                figure={
                                    'data': [
                                        {
                                            'x': ranking_popularidad['product_name'].head(10),
                                            'y': ranking_popularidad['avg_loves'].head(10),
                                            'type': 'bar',
                                            'name': 'Likes',
                                            'marker': {'color': '#6f42c1'}
                                        },
                                    ],
                                    'layout': {
                                        'title': 'Top 10 Productos por Likes',
                                        'xaxis': {'title': 'Producto', 'tickangle': 45},
                                        'yaxis': {
                                            'title': 'Likes (millones)',
                                            'tickvals': [0, 200000, 400000, 600000, 800000, 1000000, 1200000, 1400000, 1600000],
                                            'ticktext': ['0', '0.2M', '0.4M', '0.6M', '0.8M', '1M', '1.2M', '1.4M', '1.6M']
                                        },
                                        'plot_bgcolor': 'white',
                                        'paper_bgcolor': 'white',
                                    }
                                }
                            )
                        ),
                    ],
                    className="mb-4 shadow",
                ),
                # Gráfico de relación precio-popularidad
                dbc.Card(
                    [
                        dbc.CardHeader(html.H4("Relación Precio-Popularidad", className="mb-0")),
                        dbc.CardBody(
                            dcc.Graph(
                                id='grafico-relacion-precio',
                                figure={
                                    'data': [
                                        {
                                            'x': relacion_precio_popularidad['child_min_price'],
                                            'y': relacion_precio_popularidad['avg_rating'],
                                            'mode': 'markers',
                                            'name': 'Rating vs Precio',
                                            'marker': {
                                                'color': relacion_precio_popularidad['avg_reviews'],
                                                'size': 10,
                                                'showscale': True,
                                                'colorscale': 'Viridis',
                                                'colorbar': {'title': 'Núm. Reviews'}
                                            }
                                        }
                                    ],
                                    'layout': {
                                        'title': 'Relación Precio-Rating-Reviews',
                                        'xaxis': {'title': 'Precio mínimo'},
                                        'yaxis': {'title': 'Rating promedio'},
                                        'hovermode': 'closest',
                                        'plot_bgcolor': 'white',
                                        'paper_bgcolor': 'white',
                                    }
                                }
                            )
                        ),
                    ],
                    className="mb-4 shadow",
                ),
            ],
            md=12,
            lg=7,
        ),
        # Columna derecha con productos destacados
        dbc.Col(
            [
                dbc.Card(
                    [
                        dbc.CardHeader(html.H4("Productos Más Populares", className="mb-0")),
                        dbc.CardBody(
                            [
                                html.Ul(
                                    [
                                        html.Li(
                                            [
                                                html.Strong(product),
                                                html.Br(),
                                                html.Small(f"{likes/1000000:.1f}M likes", style={'color': '#6f42c1'})
                                            ],
                                            style={
                                                'padding': '10px',
                                                'borderBottom': '1px solid #eee',
                                                'listStyleType': 'none'
                                            }
                                        )
                                        for product, likes in zip(
                                            [
                                                "Radiant Creamy",
                                                "Lip Sleeping Mas",
                                                "Cream Lip Stain",
                                                "Gloss Bomb Univ",
                                                "Pro Filt+ Soft Ma",
                                                "Blush",
                                                "Brow Wiz Ultra.s",
                                                "Niacinamide 10%",
                                                "Translucent Loos",
                                                "Soft Pinch Liquid"
                                            ],
                                            [1600000, 1400000, 1200000, 1000000, 800000, 600000, 400000, 200000, 100000, 50000]
                                        )
                                    ],
                                    style={'paddingLeft': '0'}
                                )
                            ]
                        ),
                    ],
                    className="mb-4 shadow",
                    style={'height': '100%'}
                ),
            ],
            md=12,
            lg=5,
        ),
    ],
    className="mb-4",
)

# Layout principal
app.layout = dbc.Container(
    [
        navbar,
        welcome_section,
        main_section,
        dbc.Row(
            dbc.Col(
                html.P(
                    "© 2023 Sephora Analytics - Todos los derechos reservados",
                    className="text-center text-muted small",
                )
            )
        ),
    ],
    fluid=True,
    style={
        "backgroundColor": "#f8f9fa",
        "minHeight": "100vh",
        "padding": "20px",
    },
)

if _name_ == '_main_':
    app.run(debug=True, host='0.0.0.0', port=8050)
