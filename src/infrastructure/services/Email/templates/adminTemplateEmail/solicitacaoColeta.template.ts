interface NovaSolicitacaoColetaTemplateProps {
  nomePonto: string;
  endereco: string;
  cidade: string;
  estado: string;
  volume: number;
  solicitacaoId: number;
}

export function novaSolicitacaoColetaTemplate({
  nomePonto,
  endereco,
  cidade,
  estado,
  volume,
  solicitacaoId
}: NovaSolicitacaoColetaTemplateProps) {

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Nova Solicitação de Coleta</title>
  </head>

  <body style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial, Helvetica, sans-serif;
  ">

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">

          <table 
            width="600"
            style="
              background:#ffffff;
              margin:40px auto;
              border-radius:10px;
              overflow:hidden;
            "
          >

            <tr>
              <td style="
                background:#15803d;
                padding:25px;
                color:white;
                text-align:center;
              ">
                <h1>
                  Nova Solicitação de Coleta
                </h1>
              </td>
            </tr>


            <tr>
              <td style="
                padding:30px;
                color:#333;
              ">

                <p>
                  Uma nova solicitação de coleta foi criada 
                  e aguarda aprovação administrativa.
                </p>


                <h3>
                  Informações do ponto
                </h3>


                <table width="100%" cellpadding="8">

                  <tr>
                    <td><strong>ID Solicitação:</strong></td>
                    <td>${solicitacaoId}</td>
                  </tr>

                  <tr>
                    <td><strong>Ponto:</strong></td>
                    <td>${nomePonto}</td>
                  </tr>

                  <tr>
                    <td><strong>Endereço:</strong></td>
                    <td>${endereco}</td>
                  </tr>

                  <tr>
                    <td><strong>Cidade:</strong></td>
                    <td>${cidade}/${estado}</td>
                  </tr>

                  <tr>
                    <td><strong>Volume informado:</strong></td>
                    <td>${volume} litros</td>
                  </tr>

                </table>


                <br>

                <p>
                  Acesse o painel administrativo para 
                  analisar e aprovar a solicitação.
                </p>


              </td>
            </tr>


            <tr>
              <td style="
                background:#f1f5f9;
                padding:20px;
                text-align:center;
                font-size:12px;
                color:#64748b;
              ">

                Sistema de Coleta Sustentável

              </td>
            </tr>


          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}